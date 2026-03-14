import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { join, resolve } from "node:path";
import { parsePlans, parseProjectVision, parseTaskFile } from "./parser.js";
import { getProjectCwd, parseSessions } from "./sessions-parser.js";

const app = new Hono();

const planDir = process.env.PLAN_DIR || resolve(process.cwd(), ".plan");
const claudeDir = process.env.CLAUDE_DIR || resolve(process.env.HOME || "~", ".claude");

app.use("/api/*", cors());

app.get("/api/plans", async (c) => {
  const plans = await parsePlans(planDir);
  const project = await parseProjectVision(planDir);
  return c.json({ plans, project: project ?? undefined });
});

app.get("/api/plans/:name", async (c) => {
  const name = c.req.param("name");
  const plans = await parsePlans(planDir);
  const plan = plans.find((p) => p.name === name);
  if (!plan) {
    return c.json({ error: "Plan not found" }, 404);
  }
  return c.json(plan);
});

app.get("/api/sessions", async (c) => {
  const projects = await parseSessions(claudeDir);
  return c.json({ projects });
});

app.get("/api/plans/:name/parts/:partNumber/tasks/:taskNumber", async (c) => {
  const { name, partNumber, taskNumber } = c.req.param();
  const task = await parseTaskFile(planDir, name, partNumber, taskNumber);
  if (!task) return c.json({ error: "Task not found" }, 404);
  return c.json({ task });
});

// Project-specific plans (loaded from project's .plan/ directory)
app.get("/api/projects/:dirName/plans", async (c) => {
  const dirName = c.req.param("dirName");
  const cwd = getProjectCwd(dirName);
  if (!cwd) {
    // Trigger session scan to populate cwd map
    await parseSessions(claudeDir);
    const cwdRetry = getProjectCwd(dirName);
    if (!cwdRetry) return c.json({ error: "Project not found" }, 404);
    const projectPlanDir = join(cwdRetry, ".plan");
    const plans = await parsePlans(projectPlanDir);
    const project = await parseProjectVision(projectPlanDir);
    return c.json({ plans, project: project ?? undefined });
  }
  const projectPlanDir = join(cwd, ".plan");
  const plans = await parsePlans(projectPlanDir);
  const project = await parseProjectVision(projectPlanDir);
  return c.json({ plans, project: project ?? undefined });
});

app.get("/api/projects/:dirName/plans/:name/parts/:partNumber/tasks/:taskNumber", async (c) => {
  const { dirName, name, partNumber, taskNumber } = c.req.param();
  let cwd = getProjectCwd(dirName);
  if (!cwd) {
    await parseSessions(claudeDir);
    cwd = getProjectCwd(dirName);
  }
  if (!cwd) return c.json({ error: "Project not found" }, 404);
  const task = await parseTaskFile(join(cwd, ".plan"), name, partNumber, taskNumber);
  if (!task) return c.json({ error: "Task not found" }, 404);
  return c.json({ task });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`Server running on http://localhost:${port}`);
console.log(`Plan directory: ${planDir}`);

serve({ fetch: app.fetch, port });
