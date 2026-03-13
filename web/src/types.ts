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
