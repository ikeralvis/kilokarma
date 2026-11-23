"use client";

import { Car, Check, Fuel, Plus, Repeat, Settings, Star, Trash2, Utensils, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { confirmRedemption, deleteFavorite } from "@/app/actions";
import { MonthFilter } from "@/components/month-filter";
import { AutoRefresh } from "@/components/auto-refresh";
import { ThemeSync, ThemeToggle } from "@/components/theme-toggle";
import { TopTabs } from "@/components/top-tabs";
import { Avatar } from "@/components/ui/avatar";
import { useRun } from "@/components/use-run";
import { balancesFor, buildLedger } from "@/lib/balance";
import { DEFAULT_REWARD_GOAL } from "@/lib/credits";
import { monthKey, monthLabel, monthsOf } from "@/lib/months";
import { groupRoutes, routeKey, type RouteGroup } from "@/lib/routes";
import type { DashboardData, FavoriteView, TripView } from "@/lib/types";
import { fmtCredits } from "@/lib/utils";
import { BalanceCard } from "./balance-card";
import { RedeemSheet } from "./redeem-sheet";
import { Timeline } from "./timeline";
import { TripSheet } from "./trip-sheet";

type Sheets = "trip" | "redeem" | null;

/** Sección «Coche»: créditos, trayectos y canjes. */
export function Dashboard({ data }: { data: DashboardData }) {
  const { me, friends, people } = data;
  const [sheet, setSheet] = useState<Sheets>(null);
  const [preset, setPreset] = useState<FavoriteView | null>(null);
  const [editing, setEditing] = useState<TripView | null>(null);
  const [month, setMonth] = useState("all");
  const [n, setN] = useState(0); // fuerza a remontar los formularios en cada apertura
  const { run, pending } = useRun();

  // Solo los canjes confirmados descuentan créditos.
  const ledger = useMemo(() => buildLedger(data.trips, data.redemptions.filter((r) => r.status === "confirmed")), [data.trips, data.redemptions]);
  const months = useMemo(() => monthsOf([...data.trips.map((t) => t.createdAt), ...data.redemptions.map((r) => r.createdAt)]), [data.trips, data.redemptions]);
  const trips = useMemo(() => data.trips.filter((t) => month === "all" || monthKey(t.createdAt) === month), [data.trips, month]);
  const redemptions = useMemo(() => data.redemptions.filter((r) => month === "all" || monthKey(r.createdAt) === month), [data.redemptions, month]);
  const routes = useMemo(() => groupRoutes(trips), [trips]);
  const allRoutes = useMemo(() => new Map(groupRoutes(data.trips).map((g) => [g.key, g])), [data.trips]);
  const toConfirm = data.redemptions.filter((r) => r.status === "pending" && r.toUserId === me.id);
  const periodKm = trips.reduce((a, t) => a + t.distanceKm, 0);
  const periodCredits = trips.reduce((a, t) => a + t.totalCredits, 0);
  // Amigos actuales + cualquiera con quien aún haya saldo pendiente.
  const pairs = useMemo(() => {
    const all = balancesFor(ledger, me.id, people.map((p) => p.id));
    const friendIds = new Set(friends.map((f) => f.id));
    return all.filter((p) => friendIds.has(p.userId) || p.net !== 0);
  }, [ledger, me.id, people, friends]);

  const goal = useMemo(() => {
    const cheapest = [...data.rewards].sort((a, b) => a.credits - b.credits)[0];
    return cheapest ? { name: cheapest.name, credits: cheapest.credits } : { name: "un canje", credits: DEFAULT_REWARD_GOAL };
  }, [data.rewards]);

  const open = (s: Exclude<Sheets, null>, p: FavoriteView | null = null, edit: TripView | null = null) => {
    setPreset(p);
    setEditing(edit);
    setN((x) => x + 1);
    setSheet(s);
  };
  const close = () => setSheet(null);
  const friendName = (id: string | null) => friends.find((f) => f.id === id)?.name;
  const nameOf = (id: string) => (id === me.id ? "Tú" : (people.find((p) => p.id === id)?.name ?? "?"));
  const routeToPreset = (g: RouteGroup): FavoriteView => ({
    id: g.key,
    name: g.destination,
    origin: g.origin,
    destination: g.destination,
    distanceKm: g.distanceKm,
    friendId: [g.driverId, ...g.passengerIds].find((id) => id !== me.id) ?? null,
    driver: g.driverId === me.id ? "me" : "friend",
  });

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2">
        <Link href="/ajustes" aria-label="Mi perfil y ajustes" className="flex items-center gap-3">
          <Avatar name={me.name} id={me.id} size={40} />
          <span>
            <span className="block text-xs text-muted">Coche</span>
            <span className="block text-sm font-semibold leading-tight">{me.name}</span>
          </span>
        </Link>
        <div className="flex gap-2">
          <ThemeToggle />
          {data.vehicle.hasCar && (
            <Link href="/ajustes#coche" aria-label="Mi coche y gasolina" className="grid size-11 place-items-center rounded-full border border-line bg-surface">
              <Fuel size={18} />
            </Link>
          )}
          <Link href="/ajustes" aria-label="Ajustes" className="relative grid size-11 place-items-center rounded-full border border-line bg-surface">
            <Settings size={18} />
            {data.pending.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">{data.pending.length}</span>
            )}
          </Link>
        </div>
      </header>

      <TopTabs />

      {toConfirm.length > 0 && (
        <section className="space-y-3 rounded-3xl border border-accent bg-surface p-4" aria-label="Canjes por confirmar">
          <p className="text-sm font-semibold">Por confirmar</p>
          {toConfirm.map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <p className="min-w-0 flex-1 text-sm">
                <b>{nameOf(r.fromUserId)}</b> dice que te invitó a <b>{r.concept}</b> ({fmtCredits(r.creditsRedeemed)} cr.)
              </p>
              <button aria-label="Confirmar" disabled={pending} onClick={() => run(() => confirmRedemption(r.id, true))} className="grid size-10 place-items-center rounded-full bg-accent text-accent-fg">
                <Check size={18} />
              </button>
              <button aria-label="Rechazar" disabled={pending} onClick={() => run(() => confirmRedemption(r.id, false))} className="grid size-10 place-items-center rounded-full bg-surface-2 text-muted">
                <X size={18} />
              </button>
            </div>
          ))}
        </section>
      )}

      <BalanceCard pairs={pairs} people={people} hasFriends={friends.length > 0} goal={goal} />

      <MonthFilter months={months} value={month} onChange={setMonth} />
      {trips.length > 0 && (
        <p className="-mt-2 px-1 text-sm text-muted">
          {month === "all" ? "En total" : monthLabel(month)}: <b className="text-fg">{trips.length}</b> {trips.length === 1 ? "viaje" : "viajes"} · <b className="text-fg">{Math.round(periodKm)}</b> km · <b className="text-fg">{periodCredits}</b> cr.
        </p>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-muted">
          <Star size={12} /> Viajes favoritos
        </h2>
        {data.favorites.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line p-4 text-sm text-muted">
            Al registrar un trayecto marca «Guardar como viaje favorito» y lo tendrás aquí a un toque.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {data.favorites.map((f) => (
              <div key={f.id} className="group relative">
                <button
                  onClick={() => open("trip", f)}
                  className="flex min-h-24 w-full flex-col justify-between rounded-3xl border border-line bg-surface p-4 text-left transition active:scale-[.97] active:bg-surface-2"
                >
                  <Car size={20} className="text-muted" />
                  <span>
                    <span className="block text-sm font-semibold leading-tight">{f.name}</span>
                    <span className="text-xs text-muted">
                      {f.distanceKm} km{friendName(f.friendId) ? ` · ${friendName(f.friendId)}` : ""}
                      {allRoutes.get(routeKey(f.origin, f.destination)) ? ` · ${allRoutes.get(routeKey(f.origin, f.destination))?.count}×` : ""}
                    </span>
                  </span>
                </button>
                <button
                  aria-label={`Borrar ${f.name}`}
                  disabled={pending}
                  onClick={() => confirm(`¿Borrar el favorito «${f.name}»?`) && run(() => deleteFavorite(f.id))}
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded-full text-muted opacity-60 hover:bg-surface-2"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {routes.some((g) => g.count > 1) && (
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-muted">
            <Repeat size={12} /> Rutas repetidas
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
            {routes
              .filter((g) => g.count > 1)
              .slice(0, 5)
              .map((g) => (
                <li key={g.key}>
                  <button onClick={() => open("trip", routeToPreset(g))} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-surface-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {g.origin ? `${g.origin} → ` : ""}
                        {g.destination}
                      </span>
                      <span className="text-xs text-muted">
                        {Math.round(g.totalKm)} km · {g.totalCredits} cr.
                      </span>
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold tabular-nums">{g.count}×</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      )}

      <Timeline trips={trips} redemptions={redemptions} people={people} meId={me.id} onEditTrip={(t) => open("trip", null, t)} />

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={() => open("trip")}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.97]"
          >
            <Plus size={20} /> Trayecto
          </button>
          <button
            onClick={() => open("redeem")}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-semibold transition active:scale-[.97]"
          >
            <Utensils size={18} /> Canjear
          </button>
        </div>
      </div>

      {sheet === "trip" && <TripSheet key={n} open onClose={close} me={me} vehicle={data.vehicle} friends={friends} preset={preset} trips={data.trips} editing={editing} />}
      {sheet === "redeem" && <RedeemSheet key={n} open onClose={close} people={people} pairs={pairs} rewards={data.rewards} />}
      <AutoRefresh />
      <ThemeSync accent={me.accentColor} />
    </div>
  );
}
