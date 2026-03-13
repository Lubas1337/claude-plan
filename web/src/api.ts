import type { PlansResponse, SessionsResponse, TaskDetail } from "./types";

export async function fetchPlans(): Promise<PlansResponse> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error(`Failed to fetch plans: ${res.statusText}`);
  return res.json();
}

export async function fetchProjectPlans(dirName: string): Promise<PlansResponse> {
  const res = await fetch(`/api/projects/${encodeURIComponent(dirName)}/plans`);
  if (!res.ok) throw new Error(`Failed to fetch project plans: ${res.statusText}`);
  return res.json();
}

export async function fetchSessions(): Promise<SessionsResponse> {
  const res = await fetch("/api/sessions");
  if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
  return res.json();
}

export async function fetchTaskDetail(
  planName: string,
  partNumber: string,
  taskNumber: string,
  projectDirName?: string,
): Promise<TaskDetail> {
  const base = projectDirName
    ? `/api/projects/${encodeURIComponent(projectDirName)}/plans`
    : "/api/plans";
  const res = await fetch(
    `${base}/${encodeURIComponent(planName)}/parts/${encodeURIComponent(partNumber)}/tasks/${encodeURIComponent(taskNumber)}`,
  );
  if (!res.ok) throw new Error("Task not found");
  const data = await res.json();
  return data.task;
}
