import type { ReactNode } from "react";

export function Card({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-4 space-y-4 rounded-3xl border border-line bg-surface p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
