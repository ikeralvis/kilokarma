"use client";

import { monthLabel } from "@/lib/months";
import { cn } from "@/lib/utils";

/** Chips horizontales para filtrar por mes. `all` = sin filtro. */
export function MonthFilter({ months, value, onChange }: { months: string[]; value: string; onChange: (v: string) => void }) {
  if (months.length === 0) return null;
  const options = ["all", ...months];
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="radiogroup" aria-label="Filtrar por mes">
      {options.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={value === m}
          onClick={() => onChange(m)}
          className={cn("h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition", value === m ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-muted")}
        >
          {m === "all" ? "Todo" : monthLabel(m)}
        </button>
      ))}
    </div>
  );
}
