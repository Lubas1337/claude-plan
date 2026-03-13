import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { resolve } from "node:path";
import { parsePlans, parseTaskFile } from "./parser.js";
import { parseSessions } from "./sessions-parser.js";

const app = new Hono();

const planDir = process.env.PLAN_DIR || resolve(process.cwd(), ".plan");
const claudeDir = process.env.CLAUDE_DIR || resolve(process.env.HOME || "~", ".claude");

app.use("/api/*", cors());

app.get("/api/plans", async (c) => {
  const plans = await parsePlans(planDir);
  return c.json({ plans });
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

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use("/*", serveStatic({ root: "./dist" }));
  app.get("*", serveStatic({ path: "./dist/index.html" }));
}

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`Server running on http://localhost:${port}`);
console.log(`Plan directory: ${planDir}`);

serve({ fetch: app.fetch, port });
