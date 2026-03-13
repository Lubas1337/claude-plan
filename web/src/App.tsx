import { useEffect, useState } from "react";
import { fetchPlans } from "./api";
import { Board } from "./components/Board";
import { Dashboard } from "./components/Dashboard";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TaskModal } from "./components/TaskModal";
import type { Plan, TaskModalState, View } from "./types";

export function App() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [view, setView] = useState<View>({ level: "dashboard" });
  const [taskModal, setTaskModal] = useState<TaskModalState | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchPlans()
      .then((data) => setPlans(data.plans))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (loading) return <div className="loading">Loading plans...</div>;
  if (error) return <div className="loading">Error: {error}</div>;

  const currentPlan =
    view.level === "plan"
      ? plans.find((p) => p.name === view.planName) ?? null
      : null;

  return (
    <div className={`app-layout ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="app-main">
        <Header
          plan={currentPlan}
          onBack={view.level === "plan" ? () => setView({ level: "dashboard" }) : null}
          theme={theme}
          onThemeToggle={toggleTheme}
        />

        {view.level === "dashboard" ? (
          <Dashboard
            plans={plans}
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
          onClose={() => setTaskModal(null)}
        />
      )}
    </div>
  );
}
