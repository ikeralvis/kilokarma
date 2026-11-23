"use client";

import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { addEventType, deleteEventType, seedEventTypes, updateEventType } from "@/app/actions";
import { Chip, inputCls } from "@/components/ui/form";
import { useRun } from "@/components/use-run";
import type { EventKind, EventScope, EventTypeView } from "@/lib/types";
import { Card } from "./card";

type Draft = { name: string; emoji: string; kind: EventKind; scope: EventScope; unit: string; xp: string; subcategories: string[] };
const toDraft = (t: EventTypeView): Draft => ({ name: t.name, emoji: t.emoji, kind: t.kind, scope: t.scope, unit: t.unit, xp: String(t.xp), subcategories: t.subcategories });
const EMPTY: Draft = { name: "", emoji: "⭐", kind: "event", scope: "group", unit: "", xp: "10", subcategories: [] };
const payload = (d: Draft) => ({ ...d, xp: Number(d.xp) || 0 });

export function TypesSection({ types }: { types: EventTypeView[] }) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const { run, pending, error } = useRun();

  return (
    <Card
      id="categorias"
      title="Categorías"
      hint="Qué registras en el Recap. Evento = entrada con lugar (restaurante, cine). Contador = suma cantidades (vuelos, noches). Individual = cada uno suma lo suyo y se compara; Grupal = solo cuenta lo que hacéis juntos."
    >
      <ul className="space-y-3">
        {types.map((t) => (
          <TypeRow key={`${t.id}-${JSON.stringify(t)}`} type={t} />
        ))}
      </ul>
      {types.length === 0 && (
        <button disabled={pending} onClick={() => run(() => seedEventTypes())} className="h-11 w-full rounded-2xl border border-line text-sm font-medium">
          Añadir categorías de ejemplo
        </button>
      )}

      <form
        className="space-y-3 rounded-2xl border border-dashed border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addEventType(payload(draft)), () => setDraft(EMPTY));
        }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Nueva categoría</p>
        <Editor d={draft} set={setDraft} />
        <button disabled={pending || !draft.name.trim()} className="h-11 w-full rounded-2xl bg-accent font-semibold text-accent-fg disabled:opacity-40">
          Añadir
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
    </Card>
  );
}

function Editor({ d, set }: { d: Draft; set: (d: Draft) => void }) {
  const [sub, setSub] = useState("");
  const addSub = () => {
    const s = sub.trim();
    if (s && !d.subcategories.some((x) => x.toLowerCase() === s.toLowerCase())) set({ ...d, subcategories: [...d.subcategories, s] });
    setSub("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[3.5rem_1fr] gap-2">
        <input value={d.emoji} onChange={(e) => set({ ...d, emoji: e.target.value })} aria-label="Emoji" className={`${inputCls} text-center`} />
        <input value={d.name} onChange={(e) => set({ ...d, name: e.target.value })} placeholder="Nombre (Restaurante, Baño…)" aria-label="Nombre" className={inputCls} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={d.kind === "event"} onClick={() => set({ ...d, kind: "event" })}>
          Evento
        </Chip>
        <Chip active={d.kind === "counter"} onClick={() => set({ ...d, kind: "counter" })}>
          Contador
        </Chip>
        <span className="w-2" />
        <Chip active={d.scope === "individual"} onClick={() => set({ ...d, scope: "individual" })}>
          Individual
        </Chip>
        <Chip active={d.scope === "group"} onClick={() => set({ ...d, scope: "group" })}>
          Grupal
        </Chip>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {d.kind === "counter" ? (
          <input value={d.unit} onChange={(e) => set({ ...d, unit: e.target.value })} placeholder="Unidad (noches…)" aria-label="Unidad" className={inputCls} />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <input value={d.xp} onChange={(e) => set({ ...d, xp: e.target.value.replace(/\D/g, "") })} inputMode="numeric" aria-label="XP por unidad" className={inputCls} />
          <span className="text-sm text-muted">XP</span>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">Subcategorías</p>
        <div className="flex flex-wrap gap-2">
          {d.subcategories.map((s) => (
            <span key={s} className="flex h-8 items-center gap-1 rounded-full bg-surface-2 pl-3 pr-1 text-sm">
              {s}
              <button type="button" aria-label={`Quitar ${s}`} onClick={() => set({ ...d, subcategories: d.subcategories.filter((x) => x !== s) })} className="grid size-6 place-items-center rounded-full text-muted">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={sub}
            onChange={(e) => setSub(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSub();
              }
            }}
            placeholder="Mexicano, Fast food…"
            className={inputCls}
          />
          <button type="button" onClick={addSub} className="h-12 shrink-0 rounded-2xl border border-line px-4 text-sm font-medium">
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeRow({ type }: { type: EventTypeView }) {
  const [d, setD] = useState<Draft>(toDraft(type));
  const { run, pending, error } = useRun();
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(type));

  return (
    <li className="space-y-3 rounded-2xl bg-surface-2 p-3">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Editor d={d} set={setD} />
        </div>
        <button
          aria-label={`Borrar ${type.name}`}
          disabled={pending}
          onClick={() => confirm(`¿Borrar «${type.name}»? Los registros ya hechos se conservan.`) && run(() => deleteEventType(type.id))}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {dirty && (
        <button disabled={pending} onClick={() => run(() => updateEventType(type.id, payload(d)))} className="h-10 w-full rounded-2xl bg-accent text-sm font-semibold text-accent-fg">
          Guardar cambios
        </button>
      )}
      {error && <p role="alert" className="text-xs text-accent-text">{error}</p>}
    </li>
  );
}
