import { useEffect, useState } from "react";
import { fetchPlans, fetchProjectPlans } from "./api";
import { Board } from "./components/Board";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TaskModal } from "./components/TaskModal";
import type { Plan, ProjectVision, TaskModalState, View } from "./types";

export function App() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [project, setProject] = useState<ProjectVision | undefined>(undefined);
  const [view, setView] = useState<View>({ level: "dashboard" });
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeProjectName, setActiveProjectName] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Load plans — from active project or local .plan/
  useEffect(() => {
    setLoading(true);
    setError("");
    const load = activeProject
      ? fetchProjectPlans(activeProject)
      : fetchPlans();
    load
      .then((data) => {
        setPlans(data.plans);
        setProject(data.project);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeProject]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleProjectSelect = (dirName: string, projectName: string) => {
    setActiveProject(dirName);
    setActiveProjectName(projectName);
    setView({ level: "dashboard" });
    setTaskModal(null);
  };

  const currentPlan =
    view.level === "plan"
      ? plans.find((p) => p.name === view.planName) ?? null
      : null;

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
      />

      <div className="app-main">
        <Header
          plan={currentPlan}
          projectName={activeProjectName || null}
          onBack={
            view.level === "plan"
              ? () => setView({ level: "dashboard" })
              : activeProject
                ? () => {
                    setActiveProject(null);
                    setActiveProjectName("");
                    setView({ level: "dashboard" });
                  }
                : null
          }
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        {loading ? (
          <div className="loading">Loading plans...</div>
        ) : error ? (
          <div className="loading">Error: {error}</div>
        ) : view.level === "dashboard" ? (
          <Dashboard
            plans={plans}
            project={project}
            onPlanSelect={(name) => setView({ level: "plan", planName: name })}
          />
        ) : currentPlan ? (
          <Board
            parts={currentPlan.parts}
            onTaskClick={(partNumber, taskNumber) =>
              setTaskModal({
                planName: currentPlan.name,
                partNumber,
                taskNumber,
              })
            }
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">Plan not found</div>
          </div>
        )}
      </div>

      {taskModal && (
        <TaskModal
          planName={taskModal.planName}
          partNumber={taskModal.partNumber}
          taskNumber={taskModal.taskNumber}
          projectDirName={activeProject ?? undefined}
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  );
}
