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
  const first = types.find((t) => t.id === presetTypeId) ?? types[0];
  const soleFriend = friends.length === 1 ? friends[0].id : null;
  const [typeId, setTypeId] = useState(first?.id ?? "");
  const [participants, setParticipants] = useState<string[]>(first?.scope === "group" && soleFriend ? [me.id, soleFriend] : [me.id]);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toLocaleDateString("sv"));
  const { run, pending, error } = useRun();

  const type = types.find((t) => t.id === typeId);
  const isCounter = type?.kind === "counter";
  const isGroup = type?.scope === "group";
  const everyone = [{ id: me.id, name: "Yo" }, ...friends.map((f) => ({ id: f.id, name: f.name }))];
  const xp = type ? type.xp * (isCounter ? qty : 1) : 0;
  const needsFriend = isGroup && participants.length < 2;

  // Subcategorías definidas + las ya usadas con este tipo.
  const subs = type ? [...new Set([...type.subcategories, ...events.filter((e) => e.typeName === type.name && e.tag).map((e) => e.tag)])].slice(0, 16) : [];

  const toggle = (id: string) => setParticipants((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const pickType = (t: EventTypeView) => {
    setTypeId(t.id);
    setTag("");
    if (t.scope === "group" && participants.length < 2 && soleFriend) setParticipants([me.id, soleFriend]);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Registrar">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!type || needsFriend) return;
          run(() => addEvent({ typeId, participantIds: participants, quantity: qty, title, tag, note: note || undefined, date }), onClose);
        }}
      >
        <Field label="¿Qué?">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <Chip key={t.id} active={typeId === t.id} onClick={() => pickType(t)}>
                {t.emoji} {t.name}
              </Chip>
            ))}
            {types.length === 0 && <p className="text-sm text-muted">Crea primero una categoría en Ajustes.</p>}
          </div>
        </Field>

        <Field label={isGroup ? "¿Con quién? (grupal)" : "¿Quién?"}>
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
          {needsFriend && <p className="text-xs text-accent-text">Esta categoría es grupal: marca al menos a un amigo.</p>}
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
          <Field label="Lugar / título">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mediterráneo" className={inputCls} />
          </Field>
        )}

        {(subs.length > 0 || !isCounter) && (
          <Field label="Subcategoría">
            {subs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subs.map((s) => (
                  <Chip key={s} active={tag.toLowerCase() === s.toLowerCase()} onClick={() => setTag(tag.toLowerCase() === s.toLowerCase() ? "" : s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            )}
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Otra…" aria-label="Otra subcategoría" className={`${inputCls} mt-2`} />
          </Field>
        )}

        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <Field label="Fecha">
            <input type="date" value={date} max={new Date().toLocaleDateString("sv")} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>
          <p className="pb-3 text-sm font-semibold text-accent-text tabular-nums">+{xp} XP</p>
        </div>

        {!isCounter && <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota (opcional)" className={inputCls} />}

        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        <SubmitButton disabled={!type || participants.length === 0 || needsFriend} pending={pending}>
          Guardar
        </SubmitButton>
      </form>
    </Sheet>
  );
}
