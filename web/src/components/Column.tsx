import type { Part, PartStatus } from "../types";
import { Card } from "./Card";

const STATUS_LABELS: Record<PartStatus, string> = {
  blocked: "Blocked",
  ready: "Ready",
  in_progress: "In Progress",
  done: "Done",
  skipped: "Skipped",
  draft: "Draft",
};

const STATUS_COLORS: Record<PartStatus, string> = {
  blocked: "var(--status-blocked)",
  ready: "var(--status-ready)",
  in_progress: "var(--status-in-progress)",
  done: "var(--status-done)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

interface ColumnProps {
  status: PartStatus;
  parts: Part[];
}

export function Column({ status, parts }: ColumnProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status] ?? status;

  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">
          <span className="column-dot" style={{ background: color }} />
          {label}
        </div>
        <span className="column-count">{parts.length}</span>
      </div>
      <div className="column-body">
        {parts.length === 0 ? (
          <div className="column-empty">No items</div>
        ) : (
          parts.map((part) => <Card key={part.number} part={part} />)
        )}
      </div>
    </div>
  );
}
