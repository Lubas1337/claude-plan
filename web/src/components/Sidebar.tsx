import { useEffect, useState } from "react";
import { fetchSessions } from "../api";
import type { ProjectSessions } from "../types";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const [projects, setProjects] = useState<ProjectSessions[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchSessions()
      .then((data) => {
        setProjects(data.projects);
        // Auto-expand first project
        if (data.projects.length > 0) {
          setExpanded(new Set([data.projects[0].dirName]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  const toggleProject = (dirName: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(dirName)) next.delete(dirName);
      else next.add(dirName);
      return next;
    });
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${open ? "open" : ""}`}
        onClick={onToggle}
        title="Sessions"
      >
        {open ? "\u2715" : "\u2630"}
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Sessions</span>
        </div>

        <div className="sidebar-body">
          {loading ? (
            <div className="sidebar-loading">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="sidebar-loading">No sessions</div>
          ) : (
            projects.map((project) => {
              const isExpanded = expanded.has(project.dirName);
              return (
                <div key={project.dirName} className="sidebar-project">
                  <button
                    className="sidebar-project-header"
                    onClick={() => toggleProject(project.dirName)}
                  >
                    <span className="sidebar-chevron">
                      {isExpanded ? "\u25BE" : "\u25B8"}
                    </span>
                    <span className="sidebar-project-name">
                      {project.projectName}
                    </span>
                    <span className="sidebar-project-count">
                      {project.sessions.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="sidebar-sessions">
                      {project.sessions.map((session) => (
                        <div key={session.id} className="sidebar-session">
                          <div className="sidebar-session-top">
                            <span className="sidebar-session-date">
                              {formatDate(session.startTime)}
                            </span>
                            <span className="sidebar-session-meta">
                              {session.messageCount} msg
                              {session.durationMs > 0 &&
                                ` \u00B7 ${formatDuration(session.durationMs)}`}
                            </span>
                          </div>
                          {session.summary && (
                            <div className="sidebar-session-summary">
                              {session.summary}
                            </div>
                          )}
                          {session.toolsUsed.length > 0 && (
                            <div className="sidebar-session-tools">
                              {session.toolsUsed.slice(0, 5).map((tool) => (
                                <span key={tool} className="sidebar-tool-badge">
                                  {tool}
                                </span>
                              ))}
                              {session.toolsUsed.length > 5 && (
                                <span className="sidebar-tool-badge">
                                  +{session.toolsUsed.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}
