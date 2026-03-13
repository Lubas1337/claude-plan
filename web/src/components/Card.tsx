import { useState } from "react";
import type { Part, PartStatus } from "../types";

const STATUS_COLORS: Record<PartStatus, string> = {
  blocked: "var(--status-blocked)",
  ready: "var(--status-ready)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  done: "var(--status-done)",
  in_progress: "var(--status-in-progress)",
  ready: "var(--status-ready)",
  blocked: "var(--status-blocked)",
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
  onTaskClick: (partNumber: string, taskNumber: string) => void;
}

export function Card({ part, onTaskClick }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const stripeColor = STATUS_COLORS[part.status] ?? "var(--border)";
  const sizeColor = SIZE_COLORS[part.size] ?? "var(--text-muted)";
  const goalTruncated =
    part.goal.length > 80 ? part.goal.slice(0, 80) + "\u2026" : part.goal;
  const hasTasks = part.tasks.length > 0;

  return (
    <div
      className={`card ${hasTasks ? "card-expandable" : ""} ${expanded ? "expanded" : ""}`}
      onClick={() => hasTasks && setExpanded(!expanded)}
    >
      <div className="card-stripe" style={{ background: stripeColor }} />
      <div className="card-top">
        <span className="card-title">
          {hasTasks && (
            <span className="card-chevron">{expanded ? "\u25BE" : "\u25B8"}</span>
          )}
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

      {expanded && hasTasks && (
        <div className="card-tasks-list">
          {part.tasks.map((task) => (
            <div
              key={task.number}
              className="card-task-row"
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(part.number, task.number);
              }}
            >
              <span
                className="card-task-dot"
                style={{
                  background:
                    TASK_STATUS_COLORS[task.status] ?? "var(--text-muted)",
                }}
              />
              <span className="card-task-number">{task.number}</span>
              <span className="card-task-name">{task.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
