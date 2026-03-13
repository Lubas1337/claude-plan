import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectSessions, Session } from "../src/types.js";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function dirNameToProjectName(dirName: string): string {
  const parts = dirName.split("-").filter(Boolean);
  return parts[parts.length - 1] ?? dirName;
}

interface JsonlEntry {
  type?: string;
  subtype?: string;
  timestamp?: string;
  durationMs?: number;
  cwd?: string;
  message?: {
    content?: string | Array<{ type: string; text?: string }>;
    role?: string;
  };
  content?: Array<{ type: string; name?: string }>;
}

interface SessionParseResult {
  session: Session;
  cwd: string;
}

async function parseSessionFile(
  filePath: string,
): Promise<SessionParseResult | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const lines = raw.split("\n").filter(Boolean);

    let startTime = "";
    let summary = "";
    let cwd = "";
    let messageCount = 0;
    const toolsSet = new Set<string>();
    let totalDurationMs = 0;

    for (const line of lines) {
      let entry: JsonlEntry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      if (entry.timestamp && !startTime) {
        startTime = entry.timestamp;
      }

      if (entry.cwd && !cwd) {
        cwd = entry.cwd;
      }

      if (entry.type === "user" || entry.type === "assistant") {
        messageCount++;
      }

      if (entry.type === "user" && !summary) {
        const msg = entry.message;
        if (msg && typeof msg === "object") {
          const content = msg.content;
          if (typeof content === "string") {
            summary = content.slice(0, 150);
          } else if (Array.isArray(content)) {
            for (const block of content) {
              if (block.type === "text" && block.text) {
                summary = block.text.slice(0, 150);
                break;
              }
            }
          }
        }
      }

      if (entry.type === "assistant" && Array.isArray(entry.content)) {
        for (const block of entry.content) {
          if (block.type === "tool_use" && block.name) {
            toolsSet.add(block.name);
          }
        }
      }

      if (
        entry.type === "system" &&
        entry.subtype === "turn_duration" &&
        typeof entry.durationMs === "number"
      ) {
        totalDurationMs += entry.durationMs;
      }
    }

    if (!startTime) return null;

    const sessionId = filePath
      .split("/")
      .pop()!
      .replace(/\.jsonl$/, "");

    summary = summary.replace(/\n/g, " ").trim();
    if (summary.length > 120) summary = summary.slice(0, 120) + "\u2026";

    return {
      session: {
        id: sessionId,
        startTime,
        summary,
        messageCount,
        toolsUsed: Array.from(toolsSet).slice(0, 15),
        durationMs: totalDurationMs,
      },
      cwd,
    };
  } catch {
    return null;
  }
}

// Map dirName → real project path (cwd) for plan loading
const projectCwdMap = new Map<string, string>();

export function getProjectCwd(dirName: string): string | undefined {
  return projectCwdMap.get(dirName);
}

export async function parseSessions(
  claudeDir: string,
): Promise<ProjectSessions[]> {
  const projectsDir = join(claudeDir, "projects");
  if (!(await exists(projectsDir))) return [];

  const entries = await readdir(projectsDir, { withFileTypes: true });
  const projectDirs = entries.filter(
    (e: { isDirectory(): boolean; name: string }) => e.isDirectory(),
  );

  const projects: ProjectSessions[] = [];

  for (const dir of projectDirs) {
    const dirPath = join(projectsDir, dir.name);
    const files = await readdir(dirPath);
    const jsonlFiles = files.filter((f: string) => f.endsWith(".jsonl"));

    if (jsonlFiles.length === 0) continue;

    const sessions: Session[] = [];
    let projectCwd = "";

    for (const file of jsonlFiles) {
      const result = await parseSessionFile(join(dirPath, file));
      if (result) {
        sessions.push(result.session);
        if (!projectCwd && result.cwd) {
          projectCwd = result.cwd;
        }
      }
    }

    if (sessions.length === 0) continue;

    // Check if project has .plan/ directory
    const hasPlan =
      projectCwd !== "" && (await exists(join(projectCwd, ".plan")));

    // Store cwd mapping for later plan loading
    if (projectCwd) {
      projectCwdMap.set(dir.name, projectCwd);
    }

    sessions.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

    projects.push({
      dirName: dir.name,
      projectPath: projectCwd || dir.name,
      projectName: dirNameToProjectName(dir.name),
      hasPlan,
      sessions,
    });
  }

  projects.sort((a, b) => {
    const aTime = a.sessions[0]?.startTime ?? "";
    const bTime = b.sessions[0]?.startTime ?? "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return projects;
}
