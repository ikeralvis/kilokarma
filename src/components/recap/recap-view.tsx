"use client";

import { Car, Plus, Settings, Settings2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { addEvent, deleteEvent, seedEventTypes } from "@/app/actions";
import { AutoRefresh } from "@/components/auto-refresh";
import { ThemeSync, ThemeToggle } from "@/components/theme-toggle";
import { TopTabs } from "@/components/top-tabs";
import { Avatar } from "@/components/ui/avatar";
import { useRun } from "@/components/use-run";
import { eventXp, nameOf } from "@/lib/recap";
import type { EventView, RecapData, TripView } from "@/lib/types";
import { cn, unitFor } from "@/lib/utils";
import { EventSheet } from "./event-sheet";
import { Ranking } from "./ranking";

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" });

type Entry = { kind: "event"; at: string; data: EventView } | { kind: "trip"; at: string; data: TripView };

/** Pantalla de inicio: diario, contadores y ranking. */
export function RecapView({ data }: { data: RecapData }) {
  const { me, friends, types, events, trips, people } = data;
  const [tab, setTab] = useState<"diary" | "ranking">("diary");
  const [sheet, setSheet] = useState(false);
  const [preset, setPreset] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const { run, pending, error } = useRun();

  const open = (typeId: string | null = null) => {
    setPreset(typeId);
    setN((x) => x + 1);
    setSheet(true);
  };

  const counters = types.filter((t) => t.kind === "counter");
  const myTotal = (name: string) =>
    events.filter((e) => e.typeName === name && e.participantIds.includes(me.id)).reduce((a, e) => a + e.quantity, 0);

  // Diario: registros + trayectos en coche, del más reciente al más antiguo.
  const entries = useMemo<Entry[]>(
    () =>
      [
        ...events.map((e) => ({ kind: "event" as const, at: e.occurredAt, data: e })),
        ...trips.map((t) => ({ kind: "trip" as const, at: t.createdAt, data: t })),
      ].sort((a, b) => b.at.localeCompare(a.at)),
    [events, trips],
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2">
        <Link href="/ajustes" aria-label="Mi perfil y ajustes" className="flex items-center gap-3">
          <Avatar name={me.name} id={me.id} size={40} />
          <span>
            <span className="block text-xs text-muted">Recap</span>
            <span className="block text-sm font-semibold leading-tight">{me.name}</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <ThemeToggle />
          <Link href="/ajustes" aria-label="Ajustes" className="relative grid size-11 place-items-center rounded-full border border-line bg-surface">
            <Settings size={18} />
            {data.pending.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">{data.pending.length}</span>
            )}
          </Link>
        </div>
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
                    <button onClick={() => open(t.id)} className="min-w-0 flex-1 p-3.5 text-left active:bg-surface-2">
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
                <p className="text-sm text-muted">Aún no tienes categorías de registro.</p>
                <button disabled={pending} onClick={() => run(() => seedEventTypes())} className="h-11 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-fg">
                  Añadir categorías de ejemplo
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
                {entries.map((it) =>
                  it.kind === "trip" ? (
                    <li key={`t-${it.data.id}`} className="flex items-center gap-3 px-4 py-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2">
                        <Car size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {it.data.origin ? `${it.data.origin} → ` : ""}
                          {it.data.destination}
                        </p>
                        <p className="truncate text-xs text-muted">
                          Viaje en coche · {nameOf(people, me.id, it.data.driverId)} conduce · {Math.round(it.data.distanceKm)} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent-text tabular-nums">+{it.data.xp}</p>
                        <p className="text-[11px] text-muted">{dateFmt.format(new Date(it.at))}</p>
                      </div>
                    </li>
                  ) : (
                    <li key={`e-${it.data.id}`} className="flex items-center gap-3 px-4 py-3.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-base">{it.data.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {it.data.kind === "counter"
                            ? `${it.data.typeName} · ${it.data.quantity}${it.data.unit ? ` ${unitFor(it.data.unit, it.data.quantity)}` : ""}`
                            : it.data.title || it.data.typeName}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {it.data.kind === "event" && it.data.title ? `${it.data.typeName} · ` : ""}
                          {it.data.tag ? `${it.data.tag} · ` : ""}
                          {it.data.participantIds.map((id) => nameOf(people, me.id, id)).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-accent-text tabular-nums">+{eventXp(it.data)}</p>
                        <p className="text-[11px] text-muted">{dateFmt.format(new Date(it.at))}</p>
                      </div>
                      {it.data.createdBy === me.id && (
                        <button
                          aria-label="Borrar registro"
                          disabled={pending}
                          onClick={() => confirm("¿Borrar este registro?") && run(() => deleteEvent(it.data.id))}
                          className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </li>
                  ),
                )}
                {entries.length === 0 && <li className="p-6 text-center text-sm text-muted">Aún no hay registros.</li>}
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
            onClick={() => open()}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.97]"
          >
            <Plus size={20} /> Registrar
          </button>
          <Link
            href="/ajustes#categorias"
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-semibold transition active:scale-[.97]"
          >
            <Settings2 size={18} /> Categorías
          </Link>
        </div>
      </div>

      {sheet && <EventSheet key={n} open onClose={() => setSheet(false)} me={me} friends={friends} types={types} events={events} presetTypeId={preset} />}
      <AutoRefresh />
      <ThemeSync accent={me.accentColor} />
    </div>
  );
}
