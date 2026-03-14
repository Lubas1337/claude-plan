import type { Part, PartStatus, Plan, ProjectVision, RoadmapPhase } from "../types";
import { ProgressBar } from "./ProgressBar";

const STATUS_COLORS: Record<PartStatus, string> = {
  blocked: "var(--status-blocked)",
  ready: "var(--status-ready)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

const PHASE_COLORS: Record<RoadmapPhase["status"], string> = {
  done: "var(--status-done)",
  active: "var(--status-in-progress)",
  planned: "var(--text-muted)",
};

interface DashboardProps {
  plans: Plan[];
  project?: ProjectVision;
  onPlanSelect: (name: string) => void;
}

function statusCounts(parts: Part[]): Partial<Record<PartStatus, number>> {
  const counts: Partial<Record<PartStatus, number>> = {};
  for (const p of parts) {
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  return counts;
}

function ProjectOverview({
  project,
  plans,
  onPlanSelect,
}: {
  project: ProjectVision;
  plans: Plan[];
  onPlanSelect: (name: string) => void;
}) {
  return (
    <div className="project-overview">
      <div className="project-overview-header">
        <span className="project-overview-name">{project.name}</span>
      </div>

      {project.mission && (
        <div className="project-overview-mission">{project.mission}</div>
      )}
      {project.vision && (
        <div className="project-overview-vision">{project.vision}</div>
      )}

      {project.roadmap.length > 0 && (
        <div className="project-roadmap">
          {project.roadmap.map((phase) => (
            <div
              key={phase.number}
              className={`roadmap-phase roadmap-phase-${phase.status}`}
              style={{ borderLeftColor: PHASE_COLORS[phase.status] }}
            >
              <div className="roadmap-phase-header">
                <span className="roadmap-phase-number">{phase.number}</span>
                <span className="roadmap-phase-name">{phase.name}</span>
                <span className={`roadmap-phase-status roadmap-phase-status-${phase.status}`}>
                  {phase.status}
                </span>
              </div>
              {phase.goal && (
                <div className="roadmap-phase-goal">{phase.goal}</div>
              )}
              {phase.plans.length > 0 && (
                <div className="roadmap-phase-plans">
                  {phase.plans.map((planName) => {
                    const plan = plans.find((p) => p.name === planName);
                    return (
                      <button
                        key={planName}
                        className={`roadmap-plan-badge ${plan?.planStatus === "completed" ? "completed" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlanSelect(planName);
                        }}
                      >
                        {planName}
                        {plan && <span className="roadmap-plan-progress">{plan.progress}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {project.strategicGoals.length > 0 && (
        <div className="project-goals">
          <div className="project-goals-title">Strategic Goals</div>
          <ul className="project-goals-list">
            {project.strategicGoals.map((goal, idx) => (
              <li key={idx}>{goal}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function Dashboard({ plans, project, onPlanSelect }: DashboardProps) {
  if (plans.length === 0 && !project) {
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
    <>
      {project && (
        <ProjectOverview project={project} plans={plans} onPlanSelect={onPlanSelect} />
      )}
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
    </>
  );
}
