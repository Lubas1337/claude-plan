import type { Plan } from "../types";
import { ProgressBar } from "./ProgressBar";

interface HeaderProps {
  plans: Plan[];
  activePlan: string;
  onPlanSelect: (name: string) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export function Header({
  plans,
  activePlan,
  onPlanSelect,
  theme,
  onThemeToggle,
}: HeaderProps) {
  const plan = plans.find((p) => p.name === activePlan);
  const doneParts = plan?.parts.filter((p) => p.status === "done").length ?? 0;
  const totalParts = plan?.parts.length ?? 0;

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">.plan/</span>
        {plans.length > 1 && (
          <nav className="plan-tabs">
            {plans.map((p) => (
              <button
                key={p.name}
                className={`plan-tab ${p.name === activePlan ? "active" : ""}`}
                onClick={() => onPlanSelect(p.name)}
              >
                {p.name}
              </button>
            ))}
          </nav>
        )}
      </div>
      <div className="header-right">
        {plan && <ProgressBar done={doneParts} total={totalParts} />}
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "\u2600" : "\u263E"}
        </button>
      </div>
    </header>
  );
}
