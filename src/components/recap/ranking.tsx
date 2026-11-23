"use client";

import { Car } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { MonthFilter } from "@/components/month-filter";
import { monthKey, monthLabel, monthsOf } from "@/lib/months";
import { carStats, palmares, statsByType, tierFor, xpByUser, xpInMonth, type TypeStat } from "@/lib/recap";
import { useNow } from "@/lib/use-now";
import type { EventView, Person, TripView } from "@/lib/types";
import { cn, unitFor } from "@/lib/utils";

type Props = { me: Person; friends: Person[]; events: EventView[]; trips: TripView[] };

/** Ranking: acumulado (con el filtro de mes de la pantalla) y liga mensual (empieza de cero cada mes). */
export function Ranking({
  allEvents,
  allTrips,
  months,
  month,
  onMonth,
  ...props
}: Props & { allEvents: EventView[]; allTrips: TripView[]; months: string[]; month: string; onMonth: (m: string) => void }) {
  const [view, setView] = useState<"total" | "league">("total");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1" role="tablist" aria-label="Tipo de ranking">
        {(
          [
            ["total", "Acumulado"],
            ["league", "Liga mensual"],
          ] as const
        ).map(([id, label]) => (
          <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)} className={cn("h-9 rounded-xl text-sm font-medium transition", view === id ? "bg-surface text-fg shadow-sm" : "text-muted")}>
            {label}
          </button>
        ))}
      </div>
      {view === "total" ? (
        <>
          <MonthFilter months={months} value={month} onChange={onMonth} />
          <Totals {...props} />
        </>
      ) : <League me={props.me} friends={props.friends} events={allEvents} trips={allTrips} />}
    </div>
  );
}

function League({ me, friends, events, trips }: Props) {
  const now = useNow();
  const currentKey = now === null ? null : monthKey(now);
  const players = [me, ...friends];
  const ids = players.map((p) => p.id);
  const dataMonths = monthsOf([...events.map((e) => e.occurredAt), ...trips.map((t) => t.createdAt)]);
  const months = currentKey && !dataMonths.includes(currentKey) ? [currentKey, ...dataMonths] : dataMonths;
  const [picked, setPicked] = useState<string | null>(null);
  const key = picked ?? currentKey ?? months[0] ?? null;

  const hall = palmares(events, trips, ids, currentKey);
  const trophies = new Map<string, number>();
  for (const m of hall) for (const w of m.winners) trophies.set(w, (trophies.get(w) ?? 0) + 1);
  const label = (p: Person) => (p.id === me.id ? "Tú" : p.name);

  if (!key) return <p className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">La liga empieza en cuanto registres algo. Cada mes se reinicia y el ganador se lleva un 🏆.</p>;

  const xp = xpInMonth(events, trips, key);
  const board = players.map((p) => ({ ...p, xp: xp.get(p.id) ?? 0 })).sort((a, b) => b.xp - a.xp);
  const top = board[0]?.xp ?? 0;
  const closed = currentKey !== null && key < currentKey;
  const daysLeft = now !== null && key === currentKey ? (() => { const d = new Date(now); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - d.getDate() + 1; })() : null;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="radiogroup" aria-label="Mes de la liga">
        {months.map((m) => (
          <button key={m} role="radio" aria-checked={key === m} onClick={() => setPicked(m)} className={cn("h-9 shrink-0 rounded-full border px-4 text-sm font-medium", key === m ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface text-muted")}>
            {monthLabel(m)}
          </button>
        ))}
      </div>

      <section className="space-y-4 rounded-3xl border border-line bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">{monthLabel(key)}</h2>
          <span className="text-xs text-muted">{closed ? "Cerrada" : daysLeft !== null ? `Quedan ${daysLeft} ${daysLeft === 1 ? "día" : "días"}` : ""}</span>
        </div>
        <ol className="space-y-3">
          {board.map((p, i) => (
            <li key={p.id} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 text-sm">
              <span className="text-center">{p.xp > 0 && i < 3 ? medals[i] : i + 1}</span>
              <span className="space-y-1">
                <span className="flex items-center gap-2 font-medium">
                  {label(p)}
                  {closed && p.xp > 0 && p.xp === top && <span title="Ganador del mes">🏆</span>}
                </span>
                <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${top > 0 ? (p.xp / top) * 100 : 0}%` }} />
                </span>
              </span>
              <span className="font-semibold tabular-nums">{p.xp} XP</span>
            </li>
          ))}
        </ol>
        {top === 0 && <p className="text-xs text-muted">Nadie ha sumado XP este mes todavía.</p>}
      </section>

      <section className="space-y-3 rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Palmarés</h2>
        {hall.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay meses cerrados. El 🏆 se reparte al acabar cada mes.</p>
        ) : (
          <>
            <p className="text-sm font-semibold">
              {players
                .filter((p) => trophies.has(p.id))
                .sort((a, b) => (trophies.get(b.id) ?? 0) - (trophies.get(a.id) ?? 0))
                .map((p) => `${label(p)} 🏆${trophies.get(p.id)}`)
                .join(" · ")}
            </p>
            <ul className="divide-y divide-line text-sm">
              {hall.map((m) => (
                <li key={m.key} className="flex items-center justify-between py-2">
                  <span>{monthLabel(m.key)}</span>
                  <span className="font-medium">
                    🏆 {m.winners.map((w) => label(players.find((p) => p.id === w) ?? { id: w, name: "?" })).join(" y ")} <span className="font-normal text-muted">· {m.xp} XP</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Totals({
  me,
  friends,
  events,
  trips,
}: Props) {
  const players = [me, ...friends];
  const ids = players.map((p) => p.id);
  const xp = xpByUser(events, trips);
  const board = players.map((p) => ({ ...p, xp: xp.get(p.id) ?? 0 })).sort((a, b) => b.xp - a.xp);
  const stats = statsByType(events, ids);
  const car = carStats(trips);
  const label = (p: Person) => (p.id === me.id ? "Tú" : p.name);

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted">Clasificación XP</h2>
        <ol className="space-y-4">
          {board.map((p, i) => {
            const t = tierFor(p.xp);
            return (
              <li key={p.id} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-semibold text-muted tabular-nums">{i + 1}</span>
                <Avatar name={p.name} id={p.id} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {label(p)} <span className="font-normal text-muted">{t.tier.icon} {t.tier.name}</span>
                    </p>
                    <p className="text-sm font-semibold tabular-nums">{p.xp} XP</p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${Math.max(4, t.progress * 100)}%` }} />
                  </div>
                  {t.next && (
                    <p className="mt-1 text-[11px] text-muted">
                      {t.next.xp - p.xp} XP para {t.next.icon} {t.next.name}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-[11px] text-muted">
          El XP sale de los registros del diario y de cada trayecto en coche. No se cambia por créditos. Medallas: 🥉 50 · 🥈 200 · 🥇 500 · 🏆 1200 · 💎 3000.
        </p>
      </section>

      {players.length > 1 && trips.length > 0 && (
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Car size={16} /> Viajes en coche
          </h3>
          <Bars players={players} me={me.id} values={car.count} unit="viajes" leaderId={leader(car.count)} />
          <p className="mt-2 text-xs text-muted">{players.map((p) => `${label(p)} ${Math.round(car.km.get(p.id) ?? 0)} km`).join(" · ")}</p>
        </section>
      )}

      {stats.map((s) => (
        <TypeCard key={s.key} s={s} players={players} me={me.id} />
      ))}
      {stats.length === 0 && <p className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">Registra planes, viajes o contadores y aquí aparecerá la competición.</p>}
    </div>
  );
}

function TypeCard({ s, players, me }: { s: TypeStat; players: Person[]; me: string }) {
  const group = s.scope === "group";
  const name = (id: string) => (id === me ? "Tú" : (players.find((p) => p.id === id)?.name ?? "?"));
  const maxSub = Math.max(1, ...s.subs.map((x) => x.total));

  return (
    <section className="space-y-4 rounded-3xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {s.emoji} {s.name}
          <span className="ml-2 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">{group ? "Grupal" : "Individual"}</span>
        </h3>
        {(group || s.together > 0) && (
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">
            Juntos: {s.together}
            {s.unit ? ` ${unitFor(s.unit, s.together)}` : ""}
          </span>
        )}
      </div>

      {!group && <Bars players={players} me={me} values={s.totals} unit={s.unit} leaderId={s.leaderId} />}

      {s.subs.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Por subcategoría</p>
          <ul className="space-y-2.5">
            {s.subs.map((sub) => (
              <li key={sub.name} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{sub.name}</span>
                  <span className="font-semibold tabular-nums">{sub.total}</span>
                </div>
                <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(sub.total / maxSub) * 100}%` }} />
                </span>
                {!group && sub.perUser.size > 1 && (
                  <p className="text-[11px] text-muted">{[...sub.perUser.entries()].map(([id, v]) => `${name(id)} ${v}`).join(" · ")}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function leader(m: Map<string, number>): string | null {
  const s = [...m.entries()].sort((a, b) => b[1] - a[1]);
  return s.length > 0 && (s.length === 1 || s[0][1] > s[1][1]) ? s[0][0] : null;
}

function Bars({ players, me, values, unit, leaderId }: { players: Person[]; me: string; values: Map<string, number>; unit: string; leaderId: string | null }) {
  const max = Math.max(1, ...players.map((p) => values.get(p.id) ?? 0));
  return (
    <ul className="space-y-2.5">
      {players.map((p) => {
        const v = values.get(p.id) ?? 0;
        return (
          <li key={p.id} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 text-sm">
            <span className="truncate">{p.id === me ? "Tú" : p.name}</span>
            <span className="h-2 overflow-hidden rounded-full bg-surface-2">
              <span className={`block h-full rounded-full ${leaderId === p.id ? "bg-accent-text" : "bg-accent"}`} style={{ width: `${(v / max) * 100}%` }} />
            </span>
            <span className="min-w-12 text-right font-semibold tabular-nums">
              {leaderId === p.id && "🏆 "}
              {v}
              {unit ? <span className="ml-1 text-xs font-normal text-muted">{unitFor(unit, v)}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
