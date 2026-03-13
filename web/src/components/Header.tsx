import type { Plan } from "../types";
import { ProgressBar } from "./ProgressBar";

interface HeaderProps {
  plan: Plan | null;
  onBack: (() => void) | null;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export function Header({ plan, onBack, theme, onThemeToggle }: HeaderProps) {
  const doneParts = plan?.parts.filter((p) => p.status === "done").length ?? 0;
  const totalParts = plan?.parts.length ?? 0;

  return (
    <header className="header">
      <div className="header-left">
        {onBack && (
          <button className="back-button" onClick={onBack}>
            &larr;
          </button>
        )}
        <span className="header-logo">.plan/</span>
        {plan && (
          <span className="header-plan-name">{plan.name}</span>
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
