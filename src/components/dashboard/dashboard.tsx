"use client";

import { Car, Fuel, LogOut, Plus, Star, Trash2, Users, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteFavorite, signOutAction } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { useRun } from "@/components/use-run";
import { balancesFor, buildLedger } from "@/lib/balance";
import type { DashboardData, FavoriteView } from "@/lib/types";
import { BalanceCard } from "./balance-card";
import { FriendsSheet } from "./friends-sheet";
import { RedeemSheet } from "./redeem-sheet";
import { Timeline } from "./timeline";
import { TripSheet } from "./trip-sheet";
import { VehicleSheet } from "./vehicle-sheet";

type Sheets = "trip" | "redeem" | "friends" | "vehicle" | null;

export function Dashboard({ data }: { data: DashboardData }) {
  const { me, friends, people } = data;
  const [sheet, setSheet] = useState<Sheets>(null);
  const [preset, setPreset] = useState<FavoriteView | null>(null);
  const [n, setN] = useState(0); // fuerza a remontar los formularios en cada apertura
  const { run, pending } = useRun();

  const ledger = useMemo(() => buildLedger(data.trips, data.redemptions), [data.trips, data.redemptions]);
  // Amigos actuales + cualquiera con quien aún haya saldo pendiente.
  const pairs = useMemo(() => {
    const all = balancesFor(ledger, me.id, people.map((p) => p.id));
    const friendIds = new Set(friends.map((f) => f.id));
    return all.filter((p) => friendIds.has(p.userId) || p.net !== 0);
  }, [ledger, me.id, people, friends]);

  const open = (s: Exclude<Sheets, null>, p: FavoriteView | null = null) => {
    setPreset(p);
    setN((x) => x + 1);
    setSheet(s);
  };
  const close = () => setSheet(null);
  const friendName = (id: string | null) => friends.find((f) => f.id === id)?.name;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Avatar name={me.name} id={me.id} size={40} />
          <div>
            <p className="text-xs text-muted">Hola</p>
            <p className="text-sm font-semibold leading-tight">{me.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <HeaderBtn label="Mi coche" onClick={() => open("vehicle")}>
            <Fuel size={18} />
          </HeaderBtn>
          <HeaderBtn label="Amigos" onClick={() => open("friends")} badge={data.pending.length}>
            <Users size={18} />
          </HeaderBtn>
          <form action={signOutAction}>
            <HeaderBtn label="Salir" submit>
              <LogOut size={18} />
            </HeaderBtn>
          </form>
        </div>
      </header>

      <BalanceCard pairs={pairs} people={people} hasFriends={friends.length > 0} />

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

      <Timeline trips={data.trips} redemptions={data.redemptions} people={people} meId={me.id} />

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

      {sheet === "trip" && <TripSheet key={n} open onClose={close} me={me} vehicle={data.vehicle} friends={friends} preset={preset} />}
      {sheet === "redeem" && <RedeemSheet key={n} open onClose={close} people={people} pairs={pairs} />}
      {sheet === "friends" && <FriendsSheet open onClose={close} data={data} />}
      {sheet === "vehicle" && <VehicleSheet key={n} open onClose={close} vehicle={data.vehicle} />}
    </div>
  );
}

function HeaderBtn({
  label,
  onClick,
  badge = 0,
  submit,
  children,
}: {
  label: string;
  onClick?: () => void;
  badge?: number;
  submit?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={submit ? "submit" : "button"}
      aria-label={label}
      onClick={onClick}
      className="relative grid size-11 place-items-center rounded-full border border-line bg-surface"
    >
      {children}
      {badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-fg">{badge}</span>
      )}
    </button>
  );
}
