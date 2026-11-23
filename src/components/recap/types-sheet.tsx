"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { addEventType, deleteEventType, seedEventTypes, updateEventType } from "@/app/actions";
import { Chip, inputCls } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { EventKind, EventTypeView } from "@/lib/types";

type Draft = { name: string; emoji: string; kind: EventKind; unit: string; xp: string };
const toDraft = (t: EventTypeView): Draft => ({ name: t.name, emoji: t.emoji, kind: t.kind, unit: t.unit, xp: String(t.xp) });
const EMPTY: Draft = { name: "", emoji: "⭐", kind: "event", unit: "", xp: "10" };

export function TypesSheet({ open, onClose, types }: { open: boolean; onClose: () => void; types: EventTypeView[] }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const { run, pending, error } = useRun();

  return (
    <Sheet open={open} onClose={onClose} title="Tipos de registro">
      <div className="space-y-5">
        <p className="text-sm text-muted">
          <b className="font-semibold text-fg">Evento</b>: entrada de diario con lugar y categoría (restaurante, cine).{" "}
          <b className="font-semibold text-fg">Contador</b>: suma cantidades (vuelos, noches de hotel). Cada tipo da XP.
        </p>

        <ul className="space-y-2">
          {types.map((t) => (
            <TypeRow key={`${t.id}-${t.name}-${t.emoji}-${t.kind}-${t.unit}-${t.xp}`} type={t} />
          ))}
        </ul>
        {types.length === 0 && (
          <button disabled={pending} onClick={() => run(() => seedEventTypes())} className="h-11 w-full rounded-2xl border border-line text-sm font-medium">
            Añadir tipos de ejemplo
          </button>
        )}

        <form
          className="space-y-3 rounded-2xl border border-dashed border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addEventType({ ...draft, xp: Number(draft.xp) || 0 }), () => setDraft(EMPTY));
          }}
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Nuevo tipo</p>
          <div className="grid grid-cols-[3.5rem_1fr] gap-2">
            <input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} aria-label="Emoji" className={`${inputCls} text-center`} />
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nombre (Bolera, Baño…)" className={inputCls} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={draft.kind === "event"} onClick={() => setDraft({ ...draft, kind: "event" })}>
              Evento
            </Chip>
            <Chip active={draft.kind === "counter"} onClick={() => setDraft({ ...draft, kind: "counter" })}>
              Contador
            </Chip>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {draft.kind === "counter" ? (
              <input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="Unidad (noches…)" className={inputCls} />
            ) : (
              <span />
            )}
            <input
              value={draft.xp}
              onChange={(e) => setDraft({ ...draft, xp: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              placeholder="XP"
              aria-label="XP por unidad"
              className={inputCls}
            />
          </div>
          <button disabled={pending || !draft.name.trim()} className="h-11 w-full rounded-2xl bg-accent font-semibold text-accent-fg disabled:opacity-40">
            Añadir
          </button>
        </form>
        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
      </div>
    </Sheet>
  );
}

function TypeRow({ type }: { type: EventTypeView }) {
  const [d, setD] = useState<Draft>(toDraft(type));
  const { run, pending, error } = useRun();
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(type));

  return (
    <li className="space-y-2 rounded-2xl bg-surface-2 p-3">
      <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-2">
        <input value={d.emoji} onChange={(e) => setD({ ...d, emoji: e.target.value })} aria-label="Emoji" className="h-10 rounded-xl bg-bg text-center text-base outline-none" />
        <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} aria-label="Nombre" className="h-10 min-w-0 rounded-xl bg-bg px-3 text-base font-medium outline-none" />
        <button aria-label={`Borrar ${type.name}`} disabled={pending} onClick={() => confirm(`¿Borrar «${type.name}»? Los registros ya hechos se conservan.`) && run(() => deleteEventType(type.id))} className="grid size-9 place-items-center rounded-full text-muted">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Chip active={d.kind === "event"} onClick={() => setD({ ...d, kind: "event" })}>
          Evento
        </Chip>
        <Chip active={d.kind === "counter"} onClick={() => setD({ ...d, kind: "counter" })}>
          Contador
        </Chip>
        {d.kind === "counter" && <input value={d.unit} onChange={(e) => setD({ ...d, unit: e.target.value })} placeholder="unidad" aria-label="Unidad" className="h-10 w-24 rounded-xl bg-bg px-3 text-base outline-none" />}
        <input value={d.xp} onChange={(e) => setD({ ...d, xp: e.target.value.replace(/\D/g, "") })} inputMode="numeric" aria-label="XP" className="h-10 w-16 rounded-xl bg-bg px-3 text-right text-base outline-none" />
        <span className="text-xs text-muted">XP</span>
        {dirty && (
          <button disabled={pending} onClick={() => run(() => updateEventType(type.id, { ...d, xp: Number(d.xp) || 0 }))} className="ml-auto h-9 rounded-full bg-accent px-4 text-sm font-semibold text-accent-fg">
            Guardar
          </button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-accent-text">{error}</p>}
    </li>
  );
}
