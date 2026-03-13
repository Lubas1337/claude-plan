import type { Part, PartStatus, Plan } from "../types";
import { ProgressBar } from "./ProgressBar";

const STATUS_COLORS: Record<PartStatus, string> = {
  blocked: "var(--status-blocked)",
  ready: "var(--status-ready)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

interface DashboardProps {
  plans: Plan[];
  onPlanSelect: (name: string) => void;
}

function statusCounts(parts: Part[]): Partial<Record<PartStatus, number>> {
  const counts: Partial<Record<PartStatus, number>> = {};
  for (const p of parts) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  return counts;
}

export function Dashboard({ plans, onPlanSelect }: DashboardProps) {
  if (plans.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">No plans found</div>
        <div className="empty-state-hint">
          Run /claude-plan:init to create a plan
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {plans.map((plan) => {
        const doneParts = plan.parts.filter((p) => p.status === "done").length;
        const totalParts = plan.parts.length;
        const counts = statusCounts(plan.parts);

        return (
          <div
            key={plan.name}
            className="dashboard-card"
            onClick={() => onPlanSelect(plan.name)}
          >
            <div className="dashboard-card-header">
              <span className="dashboard-card-name">{plan.name}</span>
              <span
                className={`dashboard-card-status ${plan.planStatus === "completed" ? "completed" : "active"}`}
              >
                {plan.planStatus}
              </span>
            </div>

            {plan.vision && (
              <div className="dashboard-card-vision">{plan.vision}</div>
            )}

            <ProgressBar done={doneParts} total={totalParts} />

            <div className="dashboard-card-stats">
              {(
                Object.entries(counts) as [PartStatus, number][]
              ).map(([status, count]) => (
                <span key={status} className="dashboard-card-stat">
                  <span
                    className="dashboard-card-dot"
                    style={{ background: STATUS_COLORS[status] }}
                  />
                  {count}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
