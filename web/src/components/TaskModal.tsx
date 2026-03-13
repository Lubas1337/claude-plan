import { useEffect, useState } from "react";
import { fetchTaskDetail } from "../api";
import type { TaskDetail } from "../types";

interface TaskModalProps {
  planName: string;
  partNumber: string;
  taskNumber: string;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  done: "var(--status-done)",
  in_progress: "var(--status-in-progress)",
  ready: "var(--status-ready)",
  blocked: "var(--status-blocked)",
  skipped: "var(--status-skipped)",
  draft: "var(--status-draft)",
};

export function TaskModal({
  planName,
  partNumber,
  taskNumber,
  onClose,
}: TaskModalProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTaskDetail(planName, partNumber, taskNumber)
      .then(setTask)
      .catch((err) => setError(err.message));
  }, [planName, partNumber, taskNumber]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const statusColor =
    STATUS_COLORS[task?.status ?? ""] ?? "var(--text-muted)";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {error ? (
          <div className="modal-loading">Error: {error}</div>
        ) : !task ? (
          <div className="modal-loading">Loading task...</div>
        ) : (
          <>
            <div className="modal-header">
              <span className="modal-title">
                Task {task.number}: {task.name}
              </span>
              <button className="modal-close" onClick={onClose}>
                &times;
              </button>
            </div>

            <span
              className="modal-status-badge"
              style={{
                color: statusColor,
                background: `color-mix(in srgb, ${statusColor} 15%, transparent)`,
              }}
            >
              {task.status}
            </span>

            {task.action && (
              <div className="modal-section">
                <div className="modal-section-title">Action</div>
                <div className="modal-section-body">{task.action}</div>
              </div>
            )}

            {task.acceptanceCriteria.length > 0 && (
              <div className="modal-section">
                <div className="modal-section-title">Acceptance Criteria</div>
                <ul className="modal-list">
                  {task.acceptanceCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.filesAffected.length > 0 && (
              <div className="modal-section">
                <div className="modal-section-title">Files Affected</div>
                <ul className="modal-list">
                  {task.filesAffected.map((f, i) => (
                    <li key={i} className="modal-file">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {task.result && (
              <div className="modal-section">
                <div className="modal-section-title">Result</div>
                <div className="modal-section-body">{task.result}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
