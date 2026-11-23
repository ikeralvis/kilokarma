"use client";

import { Car, Check, Pencil, Trash2, Utensils, X } from "lucide-react";
import { cancelRedemption, confirmRedemption, deleteTrip } from "@/app/actions";
import { useRun } from "@/components/use-run";
import { useNow } from "@/lib/use-now";
import type { Person, RedemptionView, TripView } from "@/lib/types";
import { fmtCredits, timeAgo } from "@/lib/utils";

type Item =
  | { kind: "trip"; at: string; data: TripView }
  | { kind: "redemption"; at: string; data: RedemptionView };

export function Timeline({
  trips,
  redemptions,
  people,
  meId,
  onEditTrip,
}: {
  trips: TripView[];
  redemptions: RedemptionView[];
  people: Person[];
  meId: string;
  onEditTrip: (t: TripView) => void;
}) {
  const now = useNow();
  const { run, pending, error } = useRun();
  const name = (id: string) => (id === meId ? "Tú" : (people.find((m) => m.id === id)?.name ?? "?"));
  const items: Item[] = [
    ...trips.map((t) => ({ kind: "trip" as const, at: t.createdAt, data: t })),
    ...redemptions.map((r) => ({ kind: "redemption" as const, at: r.createdAt, data: r })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <section>
      <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted">Actividad</h2>
      <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
        {items.map((it) => {
          const pendingRedeem = it.kind === "redemption" && it.data.status === "pending";
          return (
            <li key={`${it.kind}-${it.data.id}`} className="flex items-center gap-3 px-4 py-3.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full ${it.kind === "trip" ? "bg-surface-2 text-fg" : "bg-accent/15 text-accent-text"}`}>
                {it.kind === "trip" ? <Car size={17} /> : <Utensils size={17} />}
              </span>
              <div className="min-w-0 flex-1">
                {it.kind === "trip" ? (
                  <>
                    <p className="truncate text-sm font-medium">
                      {it.data.origin ? `${it.data.origin} → ` : ""}
                      {it.data.destination}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {name(it.data.driverId)} conduce · {fmtCredits(it.data.distanceKm)} km · {it.data.costEur.toFixed(2)} € · {it.data.passengers.map((p) => name(p.passengerId)).join(", ")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="truncate text-sm font-medium">{it.data.concept}</p>
                    <p className="truncate text-xs text-muted">
                      {name(it.data.fromUserId)} invita a {name(it.data.toUserId)}
                      {pendingRedeem && <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-fg">Pendiente</span>}
                    </p>
                  </>
                )}
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold tabular-nums ${it.kind === "trip" ? "" : pendingRedeem ? "text-muted" : "text-accent-text"}`}>
                  {it.kind === "trip" ? `+${fmtCredits(it.data.totalCredits)}` : `−${fmtCredits(it.data.creditsRedeemed)}`} <span className="text-xs font-normal text-muted">cr.</span>
                </p>
                <p className="text-[11px] text-muted">{now === null ? " " : timeAgo(it.at, now)}</p>
              </div>

              {it.kind === "trip" && it.data.createdBy === meId && (
                <div className="flex">
                  <button aria-label="Editar viaje" onClick={() => onEditTrip(it.data)} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                    <Pencil size={14} />
                  </button>
                  <button
                    aria-label="Borrar viaje"
                    disabled={pending}
                    onClick={() => confirm("¿Borrar este viaje?") && run(() => deleteTrip(it.data.id))}
                    className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {it.kind === "redemption" && pendingRedeem && it.data.toUserId === meId && (
                <div className="flex gap-1">
                  <button aria-label="Confirmar canje" disabled={pending} onClick={() => run(() => confirmRedemption(it.data.id, true))} className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check size={16} />
                  </button>
                  <button aria-label="Rechazar canje" disabled={pending} onClick={() => run(() => confirmRedemption(it.data.id, false))} className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted">
                    <X size={16} />
                  </button>
                </div>
              )}
              {it.kind === "redemption" && pendingRedeem && it.data.fromUserId === meId && (
                <button aria-label="Cancelar canje" disabled={pending} onClick={() => run(() => cancelRedemption(it.data.id))} className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2">
                  <X size={15} />
                </button>
              )}
            </li>
          );
        })}
        {items.length === 0 && <li className="p-6 text-center text-sm text-muted">Aún no hay actividad.</li>}
      </ul>
      {error && <p role="alert" className="mt-2 text-sm text-accent-text">{error}</p>}
    </section>
  );
}
