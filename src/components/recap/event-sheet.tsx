"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { addEvent } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { EventTypeView, EventView, FriendView, Person } from "@/lib/types";

export function EventSheet({
  open,
  onClose,
  me,
  friends,
  types,
  events,
  presetTypeId,
}: {
  open: boolean;
  onClose: () => void;
  me: Person;
  friends: FriendView[];
  types: EventTypeView[];
  events: EventView[];
  presetTypeId?: string | null;
}) {
  // El padre monta este componente con `key` distinto por apertura → el estado se reinicia solo.
  const [typeId, setTypeId] = useState(presetTypeId ?? types[0]?.id ?? "");
  const [participants, setParticipants] = useState<string[]>([me.id]);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("sv"));
  const { run, pending, error } = useRun();

  const type = types.find((t) => t.id === typeId);
  const isCounter = type?.kind === "counter";
  const everyone = [{ id: me.id, name: "Yo" }, ...friends.map((f) => ({ id: f.id, name: f.name }))];
  const xp = type ? type.xp * (isCounter ? qty : 1) : 0;

  // Categorías ya usadas con este tipo, para repetirlas con un toque.
  const knownTags = [...new Set(events.filter((e) => e.typeName === type?.name && e.tag).map((e) => e.tag))].slice(0, 8);

  const toggle = (id: string) => setParticipants((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Sheet open={open} onClose={onClose} title="Registrar">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!type) return;
          run(() => addEvent({ typeId, participantIds: participants, quantity: qty, title, tag, note: note || undefined, date }), onClose);
        }}
      >
        <Field label="¿Qué?">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Chip key={t.id} active={typeId === t.id} onClick={() => setTypeId(t.id)}>
                {t.emoji} {t.name}
              </Chip>
            ))}
            {types.length === 0 && <p className="text-sm text-muted">Crea primero un tipo en «Tipos».</p>}
          </div>
        </Field>

        <Field label="¿Quién?">
          <div className="flex flex-wrap gap-2">
            {everyone.map((m) => (
              <Chip key={m.id} active={participants.includes(m.id)} onClick={() => toggle(m.id)}>
                {m.name}
              </Chip>
            ))}
            {friends.length > 0 && (
              <button type="button" onClick={() => setParticipants(everyone.map((m) => m.id))} className="h-10 px-2 text-xs font-medium text-muted underline underline-offset-4">
                Todos
              </button>
            )}
          </div>
        </Field>

        {isCounter ? (
          <Field label={`Cantidad${type?.unit ? ` (${type.unit})` : ""}`}>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Menos" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-12 place-items-center rounded-2xl border border-line bg-bg">
                <Minus size={18} />
              </button>
              <span className="w-12 text-center text-2xl font-semibold tabular-nums">{qty}</span>
              <button type="button" aria-label="Más" onClick={() => setQty((q) => Math.min(1000, q + 1))} className="grid size-12 place-items-center rounded-2xl border border-line bg-bg">
                <Plus size={18} />
              </button>
            </div>
          </Field>
        ) : (
          <>
            <Field label="Lugar / título">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mediterráneo" className={inputCls} />
            </Field>
            <Field label="Categoría">
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="mediterránea, pintxos…" className={inputCls} />
              {knownTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {knownTags.map((t) => (
                    <button key={t} type="button" onClick={() => setTag(t)} className="h-8 rounded-full bg-surface-2 px-3 text-xs font-medium">
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </Field>
          </>
        )}

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <Field label="Fecha">
            <input type="date" value={date} max={new Date().toLocaleDateString("sv")} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <p className="pb-3 text-sm font-semibold text-accent-text tabular-nums">+{xp} XP</p>
        </div>

        {!isCounter && <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" className={inputCls} />}

        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        <SubmitButton disabled={!type || participants.length === 0} pending={pending}>
          Guardar
        </SubmitButton>
      </form>
    </Sheet>
  );
}
