"use client";

import { useState } from "react";
import { redeem } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { PairBalance } from "@/lib/balance";
import type { Person } from "@/lib/types";
import { fmtCredits } from "@/lib/utils";

const QUICK = [
  { label: "−15 cr. Cañas", credits: 15, concept: "Cañas" },
  { label: "−40 cr. Cena", credits: 40, concept: "Cena" },
];

export function RedeemSheet({
  open,
  onClose,
  people,
  pairs,
}: {
  open: boolean;
  onClose: () => void;
  people: Person[];
  /** Saldos de «yo» contra cada persona. Se invita a quien se le debe (net < 0). */
  pairs: PairBalance[];
}) {
  const creditors = pairs.filter((p) => p.net < 0);
  const [toUserId, setTo] = useState(creditors[0]?.userId ?? "");
  const [concept, setConcept] = useState("");
  const [credits, setCredits] = useState("");
  const { run, pending, error } = useRun();

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
            if (valid) run(() => redeem({ toUserId, concept, credits: amount }), onClose);
          }}
        >
          <Field label="¿A quién invitas?">
            <div className="flex flex-wrap gap-2">
              {creditors.map((p) => (
                <Chip key={p.userId} active={toUserId === p.userId} onClick={() => setTo(p.userId)}>
                  {people.find((x) => x.id === p.userId)?.name} · {fmtCredits(-p.net)}
                </Chip>
              ))}
            </div>
          </Field>

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
            <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Concepto (dos rondas…)" className={inputCls} />
            <input
              value={credits}
              onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="cr."
              className={inputCls}
            />
          </div>

          {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
          <SubmitButton disabled={!valid} pending={pending}>
            Registrar invitación
          </SubmitButton>
        </form>
      )}
    </Sheet>
  );
}
