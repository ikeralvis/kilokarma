"use client";

import { Car, Utensils } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { Member, RedemptionView, TripView } from "@/lib/mock";
import { fmtCredits, timeAgo } from "@/lib/utils";

type Item =
  | { kind: "trip"; at: string; data: TripView }
  | { kind: "redemption"; at: string; data: RedemptionView };

/** Reloj por minutos; `null` en servidor/hidratación (evita Date.now() en prerender). */
function subscribe(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;
function useNow(): number | null {
  return useSyncExternalStore(subscribe, minuteNow, () => null);
}

export function Timeline({
  trips,
  redemptions,
  members,
  meId,
}: {
  trips: TripView[];
  redemptions: RedemptionView[];
  members: Member[];
  meId: string;
}) {
  const now = useNow();
  const name = (id: string) => (id === meId ? "Tú" : (members.find((m) => m.id === id)?.name ?? "?"));
  const items: Item[] = [
    ...trips.map((t) => ({ kind: "trip" as const, at: t.createdAt, data: t })),
    ...redemptions.map((r) => ({ kind: "redemption" as const, at: r.createdAt, data: r })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted">Actividad</h2>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
        {items.map((it) => (
          <li key={`${it.kind}-${it.data.id}`} className="flex items-center gap-3 px-4 py-3.5">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full ${
                it.kind === "trip" ? "bg-surface-2 text-fg" : "bg-accent/15 text-accent-text"
              }`}
            >
              {it.kind === "trip" ? <Car size={17} /> : <Utensils size={17} />}
            </span>
            <div className="min-w-0 flex-1">
              {it.kind === "trip" ? (
                <>
                  <p className="truncate text-sm font-medium">{it.data.title}</p>
                  <p className="truncate text-xs text-muted">
                    {name(it.data.driverId)} conduce · {it.data.distanceKm} km ·{" "}
                    {it.data.passengers.map((p) => name(p.passengerId)).join(", ")}
                  </p>
                </>
              ) : (
                <>
                  <p className="truncate text-sm font-medium">{it.data.concept}</p>
                  <p className="truncate text-xs text-muted">
                    {name(it.data.fromUserId)} invita a {name(it.data.toUserId)}
                  </p>
                </>
              )}
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold tabular-nums ${
                  it.kind === "trip" ? "" : "text-accent-text"
                }`}
              >
                {it.kind === "trip"
                  ? `+${fmtCredits(it.data.totalCredits)}`
                  : `−${fmtCredits(it.data.creditsRedeemed)}`}{" "}
                <span className="text-xs font-normal text-muted">cr.</span>
              </p>
              <p className="text-[11px] text-muted">{now === null ? " " : timeAgo(it.at, now)}</p>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="p-6 text-center text-sm text-muted">Aún no hay actividad.</li>}
      </ul>
    </section>
  );
}
