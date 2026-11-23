"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { addReward, deleteReward } from "@/app/actions";
import { inputCls } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { RewardView } from "@/lib/types";

const SUGGESTED = [
  { name: "Pintxo", credits: 5 },
  { name: "Ronda de cañas", credits: 15 },
  { name: "Cena", credits: 40 },
];

export function RewardsSheet({ open, onClose, rewards }: { open: boolean; onClose: () => void; rewards: RewardView[] }) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const { run, pending, error } = useRun();

  return (
    <Sheet open={open} onClose={onClose} title="En qué canjear">
      <div className="space-y-5">
        <p className="text-sm text-muted">Define las invitaciones con las que saldas créditos y cuánto vale cada una.</p>

        <ul className="space-y-2">
          {rewards.map((r) => (
            <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              <span className="flex-1 text-sm font-medium">{r.name}</span>
              <span className="text-sm tabular-nums text-muted">{r.credits} cr.</span>
              <button aria-label={`Borrar ${r.name}`} disabled={pending} onClick={() => run(() => deleteReward(r.id))} className="grid size-8 place-items-center rounded-full text-muted">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
          {rewards.length === 0 && <li className="text-sm text-muted">Aún no hay ninguna.</li>}
        </ul>

        <div className="flex flex-wrap gap-2">
          {SUGGESTED.filter((s) => !rewards.some((r) => r.name === s.name)).map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => {
                setName(s.name);
                setCredits(String(s.credits));
              }}
              className="h-9 rounded-full bg-surface-2 px-3 text-xs font-medium"
            >
              + {s.name} · {s.credits}
            </button>
          ))}
        </div>

        <form
          className="grid grid-cols-[1fr_5rem_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addReward({ name, credits: Number(credits) }), () => {
              setName("");
              setCredits("");
            });
          }}
        >
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" className={inputCls} />
          <input value={credits} onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="cr." className={inputCls} />
          <button disabled={pending || !name || !credits} className="h-12 rounded-2xl bg-accent px-4 font-semibold text-accent-fg disabled:opacity-40">
            Añadir
          </button>
        </form>
        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
      </div>
    </Sheet>
  );
}
