import type { Part, PartStatus } from "../types";
import { Column } from "./Column";

const COLUMNS: PartStatus[] = ["blocked", "ready", "in_progress", "done", "skipped"];

interface BoardProps {
  parts: Part[];
}

export function Board({ parts }: BoardProps) {
  const grouped: Record<PartStatus, Part[]> = {
    blocked: [],
    ready: [],
    in_progress: [],
    done: [],
    skipped: [],
    draft: [],
  };

  for (const part of parts) {
    // Draft parts go into the blocked column
    if (part.status === "draft") {
      grouped.blocked.push(part);
    } else if (grouped[part.status]) {
      grouped[part.status].push(part);
    }
  }

  return (
    <div className="board">
      {COLUMNS.map((status) => (
        <Column key={status} status={status} parts={grouped[status]} />
      ))}
    </div>
  );
}
