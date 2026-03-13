export type PartStatus =
  | "draft"
  | "ready"
  | "in_progress"
  | "blocked"
  | "done"
  | "skipped";

export type PartSize = "S" | "M" | "L" | "XL";

export interface TaskSummary {
  number: string;
  name: string;
  status: string;
}

export interface Part {
  number: string;
  slug: string;
  name: string;
  status: PartStatus;
  size: PartSize;
  depends: string[];
  parallel: string;
  goal: string;
  agent: string;
  tasks: TaskSummary[];
  tasksDone: number;
  tasksTotal: number;
}

export interface Plan {
  name: string;
  vision: string;
  goals: string[];
  planStatus: string;
  progress: string;
  parts: Part[];
}

export interface PlansResponse {
  plans: Plan[];
}

// Navigation (state-based, no router)
export type View =
  | { level: "dashboard" }
  | { level: "plan"; planName: string };

export interface TaskModalState {
  planName: string;
  partNumber: string;
  taskNumber: string;
}

// Sessions
export interface Session {
  id: string;
  startTime: string;
  summary: string;
  messageCount: number;
  toolsUsed: string[];
  durationMs: number;
}

export interface ProjectSessions {
  dirName: string;
  projectPath: string;
  projectName: string;
  sessions: Session[];
}

export interface SessionsResponse {
  projects: ProjectSessions[];
}

// Full task data (from task files)
export interface TaskDetail {
  number: string;
  name: string;
  status: string;
  action: string;
  acceptanceCriteria: string[];
  result: string;
  filesAffected: string[];
}
