import type { PlansResponse } from "./types";

export async function fetchPlans(): Promise<PlansResponse> {
  const res = await fetch("/api/plans");
  if (!res.ok) throw new Error(`Failed to fetch plans: ${res.statusText}`);
  return res.json();
}
