import { Car } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { carStats, statsByType, tierFor, xpByUser } from "@/lib/recap";
import type { EventView, Person, TripView } from "@/lib/types";
import { unitFor } from "@/lib/utils";

export function Ranking({
  me,
  friends,
  events,
  trips,
}: {
  me: Person;
  friends: Person[];
  events: EventView[];
  trips: TripView[];
}) {
  const players = [me, ...friends];
  const ids = players.map((p) => p.id);
  const xp = xpByUser(events, trips);
  const board = players
    .map((p) => ({ ...p, xp: xp.get(p.id) ?? 0 }))
    .sort((a, b) => b.xp - a.xp);
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
        <p className="text-[11px] text-muted">1 XP por km en coche, más los XP de cada registro. Medallas: 🥉 50 · 🥈 200 · 🥇 500 · 🏆 1200 · 💎 3000.</p>
      </section>

      {players.length > 1 && (
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Car size={16} /> Viajes en coche
          </h3>
          <Bars players={players} me={me.id} values={car.count} unit="viajes" leaderId={leader(car.count)} />
          <p className="mt-2 text-xs text-muted">{players.map((p) => `${label(p)} ${Math.round(car.km.get(p.id) ?? 0)} km`).join(" · ")}</p>
        </section>
      )}

      {stats.map((s) => (
        <section key={s.key} className="rounded-3xl border border-line bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {s.emoji} {s.name}
            </h3>
            {s.together > 0 && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium">Juntos: {s.together}</span>}
          </div>
          <Bars players={players} me={me.id} values={s.totals} unit={s.unit} leaderId={s.leaderId} />
        </section>
      ))}
      {stats.length === 0 && <p className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">Registra planes, viajes o contadores y aquí aparecerá la competición.</p>}
    </div>
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
