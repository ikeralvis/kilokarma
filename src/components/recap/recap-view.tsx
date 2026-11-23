"use client";

import { Plus, Settings2, Trash2 } from "lucide-react";
import { useState } from "react";
import { addEvent, deleteEvent, seedEventTypes } from "@/app/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { ThemeToggle } from "@/components/theme-toggle";
import { TopTabs } from "@/components/top-tabs";
import { Avatar } from "@/components/ui/avatar";
import { useRun } from "@/components/use-run";
import { eventXp, nameOf } from "@/lib/recap";
import type { RecapData } from "@/lib/types";
import { cn, unitFor } from "@/lib/utils";
import { EventSheet } from "./event-sheet";
import { Ranking } from "./ranking";
import { TypesSheet } from "./types-sheet";

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" });

type Sheet = "event" | "types" | null;

export function RecapView({ data }: { data: RecapData }) {
  const { me, friends, types, events, trips, people } = data;
  const [tab, setTab] = useState<"diary" | "ranking">("diary");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [preset, setPreset] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const { run, pending, error } = useRun();

  const open = (s: Exclude<Sheet, null>, typeId: string | null = null) => {
    setPreset(typeId);
    setN((x) => x + 1);
    setSheet(s);
  };
  const close = () => setSheet(null);

  const counters = types.filter((t) => t.kind === "counter");
  const myTotal = (name: string) =>
    events.filter((e) => e.typeName === name && e.participantIds.includes(me.id)).reduce((a, e) => a + e.quantity, 0);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={me.name} id={me.id} size={40} />
          <span>
            <span className="block text-xs text-muted">Recap</span>
            <span className="block text-sm font-semibold leading-tight">{me.name}</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      <TopTabs />

      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line p-1" role="tablist">
        {(
          [
            ["diary", "Diario"],
            ["ranking", "Ranking"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("h-9 rounded-xl text-sm font-medium transition", tab === id ? "bg-accent text-accent-fg" : "text-muted")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "diary" ? (
        <>
          {counters.length > 0 && (
            <section>
              <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted">Contadores</h2>
              <div className="grid grid-cols-2 gap-3">
                {counters.map((t) => (
                  <div key={t.id} className="flex items-stretch overflow-hidden rounded-3xl border border-line bg-surface">
                    <button onClick={() => open("event", t.id)} className="min-w-0 flex-1 p-3.5 text-left active:bg-surface-2">
                      <span className="text-xl">{t.emoji}</span>
                      <span className="mt-1 block truncate text-sm font-semibold">{t.name}</span>
                      <span className="text-xs text-muted tabular-nums">
                        {myTotal(t.name)} {unitFor(t.unit, myTotal(t.name))}
                      </span>
                    </button>
                    <button
                      aria-label={`Sumar 1 a ${t.name}`}
                      disabled={pending}
                      onClick={() => run(() => addEvent({ typeId: t.id, participantIds: [me.id], quantity: 1, title: "", tag: "" }))}
                      className="grid w-12 place-items-center border-l border-line bg-surface-2 text-accent-text active:bg-accent active:text-accent-fg"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
              {error && <p role="alert" className="mt-2 text-sm text-accent-text">{error}</p>}
            </section>
          )}

          <section>
            <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted">Diario</h2>
            {types.length === 0 && events.length === 0 ? (
              <div className="space-y-3 rounded-3xl border border-dashed border-line p-5 text-center">
                <p className="text-sm text-muted">Aún no hay tipos de registro.</p>
                <button disabled={pending} onClick={() => run(() => seedEventTypes())} className="h-11 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-fg">
                  Añadir tipos de ejemplo
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
                {events.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-base">{e.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {e.kind === "counter"
                          ? `${e.typeName} · ${e.quantity}${e.unit ? ` ${unitFor(e.unit, e.quantity)}` : ""}`
                          : e.title || e.typeName}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {e.kind === "event" && e.title ? `${e.typeName} · ` : ""}
                        {e.tag ? `${e.tag} · ` : ""}
                        {e.participantIds.map((id) => nameOf(people, me.id, id)).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent-text tabular-nums">+{eventXp(e)}</p>
                      <p className="text-[11px] text-muted">{dateFmt.format(new Date(e.occurredAt))}</p>
                    </div>
                    {e.createdBy === me.id && (
                      <button
                        aria-label="Borrar registro"
                        disabled={pending}
                        onClick={() => confirm("¿Borrar este registro?") && run(() => deleteEvent(e.id))}
                        className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </li>
                ))}
                {events.length === 0 && <li className="p-6 text-center text-sm text-muted">Aún no hay registros.</li>}
              </ul>
            )}
          </section>
        </>
      ) : (
        <Ranking me={me} friends={friends} events={events} trips={trips} />
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={() => open("event")}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.97]"
          >
            <Plus size={20} /> Registrar
          </button>
          <button
            onClick={() => open("types")}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-semibold transition active:scale-[.97]"
          >
            <Settings2 size={18} /> Tipos
          </button>
        </div>
      </div>

      {sheet === "event" && <EventSheet key={n} open onClose={close} me={me} friends={friends} types={types} events={events} presetTypeId={preset} />}
      {sheet === "types" && <TypesSheet open onClose={close} types={types} />}
      <AutoRefresh />
    </div>
  );
}
