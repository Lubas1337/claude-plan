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

function dirNameToPath(dirName: string): string {
  return dirName.replace(/^-/, "/").replace(/-/g, "/");
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
  message?: {
    content?: string | Array<{ type: string; text?: string }>;
    role?: string;
  };
  content?: Array<{ type: string; name?: string }>;
}

async function parseSessionFile(filePath: string): Promise<Session | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const lines = raw.split("\n").filter(Boolean);

    let startTime = "";
    let summary = "";
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

      // Capture earliest timestamp
      if (entry.timestamp && !startTime) {
        startTime = entry.timestamp;
      }

      // Count user and assistant messages
      if (entry.type === "user" || entry.type === "assistant") {
        messageCount++;
      }

      // Extract first user message as summary
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

      // Extract tool names from assistant messages
      if (entry.type === "assistant" && Array.isArray(entry.content)) {
        for (const block of entry.content) {
          if (block.type === "tool_use" && block.name) {
            toolsSet.add(block.name);
          }
        }
      }

      // Accumulate duration from turn_duration entries
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

    // Clean up summary
    summary = summary.replace(/\n/g, " ").trim();
    if (summary.length > 120) summary = summary.slice(0, 120) + "\u2026";

    return {
      id: sessionId,
      startTime,
      summary,
      messageCount,
      toolsUsed: Array.from(toolsSet).slice(0, 15),
      durationMs: totalDurationMs,
    };
  } catch {
    return null;
  }
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
    for (const file of jsonlFiles) {
      const session = await parseSessionFile(join(dirPath, file));
      if (session) sessions.push(session);
    }

    if (sessions.length === 0) continue;

    // Sort by startTime descending (newest first)
    sessions.sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );

    projects.push({
      dirName: dir.name,
      projectPath: dirNameToPath(dir.name),
      projectName: dirNameToProjectName(dir.name),
      sessions,
    });
  }

  // Sort projects by most recent session
  projects.sort((a, b) => {
    const aTime = a.sessions[0]?.startTime ?? "";
    const bTime = b.sessions[0]?.startTime ?? "";
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

  return projects;
}
