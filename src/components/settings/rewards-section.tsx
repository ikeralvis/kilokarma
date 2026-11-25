"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { addReward, deleteReward, updateReward } from "@/app/actions";
import { Coin } from "@/components/ui/coin";
import { inputCls } from "@/components/ui/form";
import { EXPERIENCES } from "@/lib/event-defaults";
import { useRun } from "@/components/use-run";
import type { RewardView } from "@/lib/types";
import { Card } from "./card";

const SUGGESTED = EXPERIENCES;

export function RewardsSection({ rewards }: { rewards: RewardView[] }) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const { run, pending, error } = useRun();

  return (
    <Card id="canjes" title="Mi lista de canjes" hint="Lo que aceptas como pago cuando alguien te debe créditos, y su precio. Tus amigos la ven al invitarte y tú se lo puedes pedir. Mejor experiencias que cosas.">
      <ul className="space-y-2">
        {rewards.map((r) => (
          <RewardRow key={`${r.id}-${r.name}-${r.credits}`} reward={r} />
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
        <input value={credits} onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Precio" aria-label="Precio en créditos" className={inputCls} />
        <button disabled={pending || !name || !credits} className="h-12 rounded-2xl bg-accent px-4 font-semibold text-accent-fg disabled:opacity-40">
          Añadir
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
    </Card>
  );
}

/** Fila editable: cambia nombre o créditos y se guarda al salir del campo. */
function RewardRow({ reward }: { reward: RewardView }) {
  const [name, setName] = useState(reward.name);
  const [credits, setCredits] = useState(String(reward.credits));
  const { run, pending, error } = useRun();

  const save = () => {
    const c = Number(credits);
    if (name.trim() && c > 0 && (name !== reward.name || c !== reward.credits)) run(() => updateReward(reward.id, { name, credits: c }));
  };

  return (
    <li className="rounded-2xl bg-surface-2 p-2">
      <div className="flex items-center gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} aria-label="Nombre" className="h-10 min-w-0 flex-1 rounded-xl bg-transparent px-2 text-base font-medium outline-none focus:bg-bg" />
        <input
          value={credits}
          onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))}
          onBlur={save}
          inputMode="numeric"
          aria-label="Créditos"
          className="h-10 w-16 rounded-xl bg-transparent px-2 text-right text-base tabular-nums outline-none focus:bg-bg"
        />
        <Coin size={16} />
        <button aria-label={`Borrar ${reward.name}`} disabled={pending} onClick={() => run(() => deleteReward(reward.id))} className="grid size-8 place-items-center rounded-full text-muted">
          <Trash2 size={15} />
        </button>
      </div>
      {error && <p role="alert" className="px-2 pb-1 text-xs text-accent-text">{error}</p>}
    </li>
  );
}
