import type { Part, PartStatus } from "../types";

const STATUS_COLORS: Record<PartStatus, string> = {
  blocked: "var(--status-blocked)",
  ready: "var(--status-ready)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

const SIZE_COLORS: Record<string, string> = {
  S: "var(--size-s)",
  M: "var(--size-m)",
  L: "var(--size-l)",
  XL: "var(--size-xl)",
};

interface CardProps {
  part: Part;
}

export function Card({ part }: CardProps) {
  const stripeColor = STATUS_COLORS[part.status] ?? "var(--border)";
  const sizeColor = SIZE_COLORS[part.size] ?? "var(--text-muted)";
  const goalTruncated =
    part.goal.length > 80 ? part.goal.slice(0, 80) + "\u2026" : part.goal;

  return (
    <div className="card">
      <div className="card-stripe" style={{ background: stripeColor }} />
      <div className="card-top">
        <span className="card-title">
          <span className="card-number">{part.number}:</span> {part.name}
        </span>
        <span
          className="size-badge"
          style={{
            color: sizeColor,
            background: `color-mix(in srgb, ${sizeColor} 15%, transparent)`,
          }}
        >
          {part.size}
        </span>
      </div>

      {goalTruncated && <div className="card-goal">{goalTruncated}</div>}

      <div className="card-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {part.tasksTotal > 0 && (
            <span className="card-tasks">
              <span className="task-bar">
                <span
                  className="task-bar-fill"
                  style={{
                    width: `${part.tasksTotal === 0 ? 0 : (part.tasksDone / part.tasksTotal) * 100}%`,
                  }}
                />
              </span>
              {part.tasksDone}/{part.tasksTotal}
            </span>
          )}

          {part.depends.length > 0 && (
            <span className="card-depends">
              &larr; {part.depends.join(", ")}
            </span>
          )}

          {part.status === "draft" && (
            <span className="card-draft-badge">draft</span>
          )}
        </div>

        {part.agent && part.agent !== "none" && (
          <span className="card-agent">{part.agent}</span>
        )}
      </div>
    </div>
  );
}
