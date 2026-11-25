"use client";

import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { addEventType, deleteEventType, seedEventTypes, updateEventType } from "@/app/actions";
import { Field, inputCls, Segmented } from "@/components/ui/form";
import { useRun } from "@/components/use-run";
import type { EventKind, EventScope, EventTypeView } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card } from "./card";

type Draft = { name: string; emoji: string; kind: EventKind; scope: EventScope; unit: string; xp: string; subcategories: string[] };
const toDraft = (t: EventTypeView): Draft => ({ name: t.name, emoji: t.emoji, kind: t.kind, scope: t.scope, unit: t.unit, xp: String(t.xp), subcategories: t.subcategories });
const EMPTY: Draft = { name: "", emoji: "⭐", kind: "event", scope: "group", unit: "", xp: "10", subcategories: [] };
const payload = (d: Draft) => ({ ...d, xp: Number(d.xp) || 0 });

export function TypesSection({ types, shared = [] }: { types: EventTypeView[]; shared?: EventTypeView[] }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const { run, pending, error } = useRun();

  return (
    <Card id="categorias" title="Categorías" hint="Lo que podéis registrar en el Recap. Se comparten con tus amigos: tus categorías les salen a ellos y las suyas a ti. Toca una tuya para editarla.">
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
        {types.map((t) => (
          <TypeRow key={`${t.id}-${JSON.stringify(t)}`} type={t} />
        ))}
        {types.length === 0 && (
          <li className="p-4">
            <button disabled={pending} onClick={() => run(() => seedEventTypes())} className="h-11 w-full rounded-2xl border border-line text-sm font-medium">
              Añadir categorías de ejemplo
            </button>
          </li>
        )}
      </ul>

      {shared.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">De tus amigos</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {shared.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-lg">{t.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{t.name}</span>
                  <span className="block truncate text-xs text-muted">
                    {t.kind === "counter" ? "Contador" : "Evento"} · {t.scope === "group" ? "Juntos" : "Cada uno"} · {t.xp} XP · creada por {t.ownerName}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {adding ? (
        <form
          className="space-y-5 rounded-2xl border border-line p-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => addEventType(payload(draft)), () => {
              setDraft(EMPTY);
              setAdding(false);
            });
          }}
        >
          <p className="text-sm font-semibold">Nueva categoría</p>
          <Editor d={draft} set={setDraft} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setAdding(false)} className="h-11 flex-1 rounded-2xl border border-line text-sm font-medium">
              Cancelar
            </button>
            <button disabled={pending || !draft.name.trim()} className="h-11 flex-1 rounded-2xl bg-accent text-sm font-semibold text-accent-fg disabled:opacity-40">
              Crear
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sm font-medium">
          <Plus size={16} /> Nueva categoría
        </button>
      )}
      {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
    </Card>
  );
}

/** Formulario de una categoría: nombre, cómo se cuenta, quién cuenta, XP y subcategorías. */
function Editor({ d, set }: { d: Draft; set: (d: Draft) => void }) {
  const [sub, setSub] = useState("");
  const addSub = () => {
    const s = sub.trim();
    if (s && !d.subcategories.some((x) => x.toLowerCase() === s.toLowerCase())) set({ ...d, subcategories: [...d.subcategories, s] });
    setSub("");
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[3.5rem_1fr] gap-2">
        <Field label="Icono">
          <input value={d.emoji} onChange={(e) => set({ ...d, emoji: e.target.value })} className={`${inputCls} text-center`} />
        </Field>
        <Field label="Nombre">
          <input value={d.name} onChange={(e) => set({ ...d, name: e.target.value })} placeholder="Restaurante, Baño…" className={inputCls} />
        </Field>
      </div>

      <Segmented
        label="¿Cómo se registra?"
        value={d.kind}
        onChange={(kind) => set({ ...d, kind })}
        options={[
          { value: "event", label: "Evento", help: "Una entrada con lugar y fecha (restaurante, cine, visita)." },
          { value: "counter", label: "Contador", help: "Suma cantidades con un toque (vuelos, noches de hotel)." },
        ]}
      />

      <Segmented
        label="¿Quién cuenta?"
        value={d.scope}
        onChange={(scope) => set({ ...d, scope })}
        options={[
          { value: "individual", label: "Cada uno", help: "Cada uno suma lo suyo y os comparáis en el ranking." },
          { value: "group", label: "Juntos", help: "Solo cuenta lo que hacéis juntos; necesita al menos un amigo." },
        ]}
      />

      <div className={cn("grid gap-3", d.kind === "counter" ? "grid-cols-2" : "grid-cols-1")}>
        {d.kind === "counter" && (
          <Field label="Unidad">
            <input value={d.unit} onChange={(e) => set({ ...d, unit: e.target.value })} placeholder="noches, viajes…" className={inputCls} />
          </Field>
        )}
        <Field label={d.kind === "counter" ? "XP por unidad" : "XP por registro"}>
          <input value={d.xp} onChange={(e) => set({ ...d, xp: e.target.value.replace(/\D/g, "") })} inputMode="numeric" className={inputCls} />
        </Field>
      </div>

      <Field label="Subcategorías (opcional)">
        {d.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {d.subcategories.map((s) => (
              <span key={s} className="flex h-8 items-center gap-1 rounded-full bg-bg pl-3 pr-1 text-sm">
                {s}
                <button type="button" aria-label={`Quitar ${s}`} onClick={() => set({ ...d, subcategories: d.subcategories.filter((x) => x !== s) })} className="grid size-6 place-items-center rounded-full text-muted">
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
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
        <p className="text-xs text-muted">Sirven para desglosar el ranking (por ejemplo, cuántos mexicanos).</p>
      </Field>
    </div>
  );
}

function TypeRow({ type }: { type: EventTypeView }) {
  const [open, setOpen] = useState(false);
  const [d, setD] = useState<Draft>(toDraft(type));
  const { run, pending, error } = useRun();
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(type));

  return (
    <li className="bg-surface">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-lg">{type.emoji}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{type.name}</span>
          <span className="block truncate text-xs text-muted">
            {type.kind === "counter" ? "Contador" : "Evento"} · {type.scope === "group" ? "Juntos" : "Cada uno"} · {type.xp} XP
            {type.subcategories.length > 0 ? ` · ${type.subcategories.length} subcat.` : ""}
          </span>
        </span>
        <ChevronDown size={18} className={cn("shrink-0 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-line bg-surface-2/50 p-4">
          <Editor d={d} set={setD} />
          {error && <p role="alert" className="text-xs text-accent-text">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              aria-label={`Borrar ${type.name}`}
              disabled={pending}
              onClick={() => confirm(`¿Borrar «${type.name}»? Los registros ya hechos se conservan.`) && run(() => deleteEventType(type.id))}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line text-muted"
            >
              <Trash2 size={16} />
            </button>
            <button
              disabled={pending || !dirty || !d.name.trim()}
              onClick={() => run(() => updateEventType(type.id, payload(d)))}
              className="h-11 flex-1 rounded-2xl bg-accent text-sm font-semibold text-accent-fg disabled:opacity-40"
            >
              {dirty ? "Guardar cambios" : "Sin cambios"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
