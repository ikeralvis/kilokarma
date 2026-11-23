"use client";

import Link from "next/link";
import { useState } from "react";
import { redeem } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { PairBalance } from "@/lib/balance";
import type { Person, RewardView } from "@/lib/types";
import { fmtCredits } from "@/lib/utils";

export function RedeemSheet({
  open,
  onClose,
  people,
  pairs,
  rewards,
}: {
  open: boolean;
  onClose: () => void;
  people: Person[];
  /** Saldos de «yo» contra cada persona. Se invita a quien se le debe (net < 0). */
  pairs: PairBalance[];
  rewards: RewardView[];
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
        <div className="space-y-3 py-6 text-center">
          <p className="text-sm text-muted">No debes créditos a nadie ahora mismo.</p>
          <Link href="/ajustes#canjes" className="text-sm font-medium underline underline-offset-4">
            Editar en qué canjear
          </Link>
        </div>
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
            {rewards.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setConcept(q.name);
                  setCredits(String(q.credits));
                }}
                className="h-10 rounded-full bg-surface-2 px-4 text-sm font-medium active:scale-95"
              >
                {q.name} · −{q.credits}
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
            <Link href="/ajustes#canjes" className="grid h-10 place-items-center rounded-full px-3 text-sm font-medium text-muted underline underline-offset-4">
              Editar lista
            </Link>
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
