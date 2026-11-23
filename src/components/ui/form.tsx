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
