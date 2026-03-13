import type { PlansResponse, SessionsResponse, TaskDetail } from "./types";

export async function fetchPlans(): Promise<PlansResponse> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error(`Failed to fetch plans: ${res.statusText}`);
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
): Promise<TaskDetail> {
  const res = await fetch(
    `/api/plans/${encodeURIComponent(planName)}/parts/${encodeURIComponent(partNumber)}/tasks/${encodeURIComponent(taskNumber)}`,
  );
  if (!res.ok) throw new Error("Task not found");
  const data = await res.json();
  return data.task;
}
