"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import type { PairBalance } from "@/lib/balance";
import type { Member } from "@/lib/mock";
import { cn, fmtCredits } from "@/lib/utils";

export type NewRedemption = { toUserId: string; concept: string; credits: number };

const QUICK = [
  { label: "−15 cr. Cañas", credits: 15, concept: "Cañas" },
  { label: "−40 cr. Cena", credits: 40, concept: "Cena" },
];

export function RedeemSheet({
  open,
  onClose,
  members,
  pairs,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  /** Saldos de «yo» contra cada miembro. Se invita a quien se le debe (net < 0). */
  pairs: PairBalance[];
  onSubmit: (r: NewRedemption) => void;
}) {
  const creditors = pairs.filter((p) => p.net < 0);
  const [toUserId, setTo] = useState(creditors[0]?.userId ?? "");
  const [concept, setConcept] = useState("");
  const [credits, setCredits] = useState("");

  const owed = -(pairs.find((p) => p.userId === toUserId)?.net ?? 0);
  const amount = Number(credits);
  const valid = toUserId !== "" && concept.trim() !== "" && amount > 0;

  return (
    <Sheet open={open} onClose={onClose} title="Canjear créditos">
      {creditors.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No debes créditos a nadie ahora mismo.</p>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onSubmit({ toUserId, concept: concept.trim(), credits: amount });
            onClose();
          }}
        >
          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">¿A quién invitas?</span>
            <div className="flex flex-wrap gap-2">
              {creditors.map((p) => {
                const m = members.find((x) => x.id === p.userId)!;
                const active = toUserId === p.userId;
                return (
                  <button
                    key={p.userId}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTo(p.userId)}
                    className={cn(
                      "h-10 rounded-full border px-4 text-sm font-medium",
                      active ? "border-accent bg-accent text-accent-fg" : "border-line bg-bg",
                    )}
                  >
                    {m.name} · {fmtCredits(-p.net)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => {
                  setConcept(q.concept);
                  setCredits(String(Math.min(q.credits, owed)));
                }}
                className="h-10 rounded-full bg-surface-2 px-4 text-sm font-medium active:scale-95"
              >
                {q.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setConcept("Saldar todo");
                setCredits(String(owed));
              }}
              className="h-10 rounded-full bg-surface-2 px-4 text-sm font-medium active:scale-95"
            >
              Saldar todo
            </button>
          </div>

          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <input
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Concepto (dos rondas…)"
              className="h-12 rounded-2xl border border-line bg-bg px-4 text-base outline-none focus:border-accent"
            />
            <input
              value={credits}
              onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="cr."
              className="h-12 rounded-2xl border border-line bg-bg px-4 text-base outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="h-12 w-full rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.98] disabled:opacity-40"
          >
            Registrar invitación
          </button>
        </form>
      )}
    </Sheet>
  );
}
