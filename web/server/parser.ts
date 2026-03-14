import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import type { Part, PartSize, PartStatus, Plan, ProjectVision, RoadmapPhase, TaskDetail, TaskSummary } from "../src/types.js";

// --- Markdown table parser ---

interface TableRow {
  [key: string]: string;
}

function parseMarkdownTable(content: string, headerPattern?: RegExp): TableRow[] {
  const lines = content.split("\n");
  const rows: TableRow[] = [];

  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) continue;
    // Check if next line is separator (|---|...)
    const next = lines[i + 1]?.trim() ?? "";
    if (/^\|[\s-:|]+\|$/.test(next)) {
      if (!headerPattern || headerPattern.test(line)) {
        headerIdx = i;
        break;
      }
    }
  }

  if (headerIdx === -1) return rows;

  const headerLine = lines[headerIdx].trim();
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);

  // Skip header + separator
  for (let i = headerIdx + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length === 0) break;

    const row: TableRow = {};
    headers.forEach((h, idx) => {
      const key = h === "#" ? "#" : h.toLowerCase().replace(/[^a-z0-9]/g, "");
      row[key] = cells[idx] ?? "";
    });
    rows.push(row);
  }

  return rows;
}

// --- Section extractor ---

function getSection(content: string, heading: string): string {
  const regex = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  const match = content.match(regex);
  if (!match || match.index === undefined) return "";

  const start = match.index + match[0].length;
  const nextSection = content.slice(start).search(/^##\s+/m);
  const end = nextSection === -1 ? content.length : start + nextSection;
  return content.slice(start, end).trim();
}

function getFieldValue(content: string, field: string): string {
  const regex = new RegExp(`^-\\s+\\*\\*${field}\\*\\*:\\s*(.+)$`, "im");
  const match = content.match(regex);
  return match?.[1]?.trim() ?? "";
}

// --- INDEX.md parser ---

interface IndexEntry {
  name: string;
  status: string;
  progress: string;
}

function parseIndex(content: string): IndexEntry[] {
  const rows = parseMarkdownTable(content);
  return rows.map((row) => {
    // Plan column may contain markdown link [name](path)
    const planRaw = row["plan"] ?? "";
    const linkMatch = planRaw.match(/\[([^\]]+)\]/);
    const name = linkMatch ? linkMatch[1] : planRaw;
    return {
      name,
      status: row["status"] ?? "active",
      progress: row["progress"] ?? "",
    };
  });
}

// --- MASTER.md parser ---

interface MasterData {
  vision: string;
  goals: string[];
  parts: {
    number: string;
    name: string;
    status: PartStatus;
    depends: string[];
    parallel: string;
    size: PartSize;
    agent: string;
  }[];
}

function parseMaster(content: string): MasterData {
  // Vision
  const visionSection = getSection(content, "Vision");
  const vision = visionSection.split("\n")[0] ?? "";

  // Goals
  const goalsSection = getSection(content, "Goals");
  const goals = goalsSection
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());

  // Parts table
  const partsRows = parseMarkdownTable(content, /Part/i);
  const parts = partsRows.map((row) => {
    const num = row["#"] ?? row["number"] ?? "";
    const name = row["part"] ?? row["name"] ?? "";
    const status = (row["status"] ?? "draft") as PartStatus;
    const dependsRaw = row["depends"] ?? row["dependencies"] ?? "-";
    const depends =
      dependsRaw === "-" || dependsRaw === ""
        ? []
        : dependsRaw.split(",").map((d) => d.trim());
    const parallel = row["parallel"] ?? "-";
    const size = (row["size"] ?? "M") as PartSize;
    const agent = row["agent"] ?? "";
    return { number: num, name, status, depends, parallel, size, agent };
  });

  return { vision, goals, parts };
}

// --- META.md parser ---

interface MetaData {
  status: PartStatus;
  depends: string[];
  parallel: string;
  size: PartSize;
  agent: string;
  goal: string;
  tasks: TaskSummary[];
}

function parseMeta(content: string): MetaData {
  const status = (getFieldValue(content, "Status") || "draft") as PartStatus;
  const dependsRaw = getFieldValue(content, "Dependencies");
  const depends =
    !dependsRaw || dependsRaw === "-"
      ? []
      : dependsRaw.split(",").map((d) => d.trim());
  const parallel = getFieldValue(content, "Parallel") || "-";
  const size = (getFieldValue(content, "Size") || "M") as PartSize;
  const agent = getFieldValue(content, "Agent") || "";

  // Goal
  const goalSection = getSection(content, "Goal");
  const goal = goalSection.split("\n")[0] ?? "";

  // Tasks table
  const tasksRows = parseMarkdownTable(content, /Task/i);
  const tasks: TaskSummary[] = tasksRows.map((row) => ({
    number: row["#"] ?? "",
    name: row["task"] ?? "",
    status: row["status"] ?? "ready",
  }));

  return { status, depends, parallel, size, agent, goal, tasks };
}

// --- PROJECT.md parser ---

function parseProject(content: string): ProjectVision {
  // Name from title
  const titleMatch = content.match(/^#\s+Project:\s*(.+)$/m);
  const name = titleMatch?.[1]?.trim() ?? "";

  // Mission
  const missionSection = getSection(content, "Mission");
  const mission = missionSection.split("\n")[0] ?? "";

  // Vision
  const visionSection = getSection(content, "Vision");
  const vision = visionSection.split("\n")[0] ?? "";

  // Strategic Goals — numbered list
  const goalsSection = getSection(content, "Strategic Goals");
  const strategicGoals = goalsSection
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());

  // Roadmap table
  const roadmapRows = parseMarkdownTable(content, /Phase/i);
  const roadmap: RoadmapPhase[] = roadmapRows.map((row, idx) => {
    const phaseName = row["phase"] ?? "";
    const plansRaw = row["plans"] ?? "";
    const plans = plansRaw === "-" || plansRaw === ""
      ? []
      : plansRaw.split(",").map((p) => {
          const linkMatch = p.match(/\[([^\]]+)\]/);
          return linkMatch ? linkMatch[1] : p.trim();
        });
    const goal = row["goal"] ?? "";
    const status = (row["status"] ?? "planned") as RoadmapPhase["status"];
    // Extract number from phase name like "1. Foundation"
    const numMatch = phaseName.match(/^(\d+)/);
    const number = numMatch ? parseInt(numMatch[1], 10) : idx + 1;
    const cleanName = phaseName.replace(/^\d+\.\s*/, "").trim();
    return { number, name: cleanName, plans, goal, status };
  });

  // Constraints — list with -
  const constraintsSection = getSection(content, "Constraints");
  const constraints = constraintsSection
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^-\s*/, "").trim());

  // Key Decisions — list with -
  const decisionsSection = getSection(content, "Key Decisions");
  const keyDecisions = decisionsSection
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^-\s*/, "").trim());

  return { name, mission, vision, strategicGoals, roadmap, constraints, keyDecisions };
}

export async function parseProjectVision(planDir: string): Promise<ProjectVision | null> {
  const projectPath = join(planDir, "PROJECT.md");
  if (!(await exists(projectPath))) return null;
  const content = await readFile(projectPath, "utf-8");
  return parseProject(content);
}

// --- Main parser ---

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function parseTaskFile(
  planDir: string,
  planName: string,
  partNumber: string,
  taskNumber: string,
): Promise<TaskDetail | null> {
  const partsDir = join(planDir, planName, "parts");
  if (!(await exists(partsDir))) return null;

  // Find part directory starting with partNumber-
  const partEntries = await readdir(partsDir, { withFileTypes: true });
  const partDir = partEntries.find(
    (e: { isDirectory(): boolean; name: string }) =>
      e.isDirectory() && e.name.startsWith(`${partNumber}-`),
  );
  if (!partDir) return null;

  const partPath = join(partsDir, partDir.name);
  const taskEntries = await readdir(partPath);
  const taskFile = taskEntries.find(
    (name: string) => name.startsWith(`${taskNumber}-`) && name.endsWith(".md"),
  );

  // If dedicated task file exists, parse it
  if (taskFile) {
    const content = await readFile(join(partPath, taskFile), "utf-8");

    const titleMatch = content.match(/^#\s+Task\s+\d+:\s*(.+)$/m);
    const name = titleMatch?.[1]?.trim() ?? taskFile.replace(/\.md$/, "");

    const status = getFieldValue(content, "Status") || "ready";
    const action = getSection(content, "Action");
    const resultText = getSection(content, "Result");

    const acSection = getSection(content, "Acceptance Criteria");
    const acceptanceCriteria = acSection
      .split("\n")
      .filter((l) => l.trim().startsWith("- "))
      .map((l) => l.replace(/^-\s*/, "").trim());

    const faSection = getSection(content, "Files Affected");
    const filesAffected = faSection
      .split("\n")
      .filter((l) => l.trim().startsWith("- "))
      .map((l) => l.replace(/^-\s*/, "").trim());

    return {
      number: taskNumber,
      name,
      status,
      action,
      acceptanceCriteria,
      result: resultText,
      filesAffected,
    };
  }

  // Fallback: read task from META.md table
  const metaPath = join(partPath, "META.md");
  if (!(await exists(metaPath))) return null;

  const metaContent = await readFile(metaPath, "utf-8");
  const meta = parseMeta(metaContent);
  const taskRow = meta.tasks.find((t) => t.number === taskNumber);
  if (!taskRow) return null;

  // Extract extra info from META.md sections
  const goalText = getSection(metaContent, "Goal");
  const faSection = getSection(metaContent, "Files Affected");
  const filesAffected = faSection
    .split("\n")
    .filter((l) => l.trim().startsWith("- "))
    .map((l) => l.replace(/^-\s*/, "").trim());
  const notesText = getSection(metaContent, "Notes");

  return {
    number: taskNumber,
    name: taskRow.name,
    status: taskRow.status,
    action: "",
    acceptanceCriteria: [],
    result: notesText || goalText,
    filesAffected,
  };
}

export async function parsePlans(planDir: string): Promise<Plan[]> {
  if (!(await exists(planDir))) {
    return [];
  }

  // Read INDEX.md if it exists
  const indexPath = join(planDir, "INDEX.md");
  let indexEntries: IndexEntry[] = [];
  if (await exists(indexPath)) {
    const indexContent = await readFile(indexPath, "utf-8");
    indexEntries = parseIndex(indexContent);
  }

  // Find plan directories (directories with MASTER.md)
  const entries = await readdir(planDir, { withFileTypes: true });
  const planDirs = entries.filter((e: { isDirectory(): boolean; name: string }) => e.isDirectory() && e.name !== "research");

  const plans: Plan[] = [];

  for (const dir of planDirs) {
    const masterPath = join(planDir, dir.name, "MASTER.md");
    if (!(await exists(masterPath))) continue;

    const masterContent = await readFile(masterPath, "utf-8");
    const master = parseMaster(masterContent);

    // Find index entry for this plan
    const indexEntry = indexEntries.find((e) => e.name === dir.name);

    // Read META.md for each part
    const partsDir = join(planDir, dir.name, "parts");
    const partDetails: Part[] = [];

    for (const masterPart of master.parts) {
      // Find the part directory
      const partSlug = `${masterPart.number}-${masterPart.name.toLowerCase().replace(/\s+/g, "-")}`;

      let metaData: MetaData | null = null;

      // Try to find part directory matching the number
      if (await exists(partsDir)) {
        const partEntries = await readdir(partsDir, { withFileTypes: true });
        const partDir = partEntries.find(
          (e: { isDirectory(): boolean; name: string }) => e.isDirectory() && e.name.startsWith(`${masterPart.number}-`)
        );

        if (partDir) {
          const metaPath = join(partsDir, partDir.name, "META.md");
          if (await exists(metaPath)) {
            const metaContent = await readFile(metaPath, "utf-8");
            metaData = parseMeta(metaContent);
          }
        }
      }

      const part: Part = {
        number: masterPart.number,
        slug: partSlug,
        name: masterPart.name,
        status: metaData?.status ?? masterPart.status,
        size: metaData?.size ?? masterPart.size,
        depends: metaData?.depends ?? masterPart.depends,
        parallel: metaData?.parallel ?? masterPart.parallel,
        goal: metaData?.goal ?? "",
        agent: metaData?.agent ?? masterPart.agent,
        tasks: metaData?.tasks ?? [],
        tasksDone: metaData?.tasks.filter((t) => t.status === "done").length ?? 0,
        tasksTotal: metaData?.tasks.length ?? 0,
      };

      partDetails.push(part);
    }

    const doneParts = partDetails.filter((p) => p.status === "done").length;
    const totalParts = partDetails.length;

    plans.push({
      name: dir.name,
      vision: master.vision,
      goals: master.goals,
      planStatus: indexEntry?.status ?? "active",
      progress: `${doneParts}/${totalParts}`,
      parts: partDetails,
    });
  }

  return plans;
}
