import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// 16px+ evita el zoom automático de iOS en los inputs.
export const inputCls =
  "h-12 w-full rounded-2xl border border-line bg-bg px-4 text-base outline-none focus:border-accent";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      {children}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-sm font-medium transition active:scale-95",
        active ? "border-accent bg-accent text-accent-fg" : "border-line bg-bg text-fg",
        disabled && "opacity-70",
      )}
    >
      {children}
    </button>
  );
}

export function SubmitButton({ disabled, pending, children }: { disabled?: boolean; pending?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="h-12 w-full rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.98] disabled:opacity-40"
    >
      {pending ? "Guardando…" : children}
    </button>
  );
}

/** Selector de 2‑3 opciones excluyentes, con una línea de ayuda de la opción activa. */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; help: string }[];
}) {
  const active = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      <div className="grid gap-1 rounded-2xl bg-bg p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn("h-10 rounded-xl text-sm font-medium transition", value === o.value ? "bg-accent text-accent-fg" : "text-muted")}
          >
            {o.label}
          </button>
        ))}
      </div>
      {active && <p className="text-xs text-muted">{active.help}</p>}
    </div>
  );
}
