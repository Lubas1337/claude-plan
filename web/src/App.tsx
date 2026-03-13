import { useEffect, useState } from "react";
import { fetchPlans } from "./api";
import { Board } from "./components/Board";
import { Header } from "./components/Header";
import type { Plan } from "./types";

export function App() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    fetchPlans()
      .then((data) => {
        setPlans(data.plans);
        if (data.plans.length > 0 && !activePlan) {
          setActivePlan(data.plans[0].name);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  if (loading) return <div className="loading">Loading plans...</div>;
  if (error) return <div className="loading">Error: {error}</div>;

  const currentPlan = plans.find((p) => p.name === activePlan);

  return (
    <>
      <Header
        plans={plans}
        activePlan={activePlan}
        onPlanSelect={setActivePlan}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      {!currentPlan ? (
        <div className="empty-state">
          <div className="empty-state-title">No plans found</div>
          <div className="empty-state-hint">
            Run /claude-plan:init to create a plan
          </div>
        </div>
      ) : (
        <Board parts={currentPlan.parts} />
      )}
    </>
  );
}
