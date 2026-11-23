"use client";

import { Car, Check, ChevronDown, Dumbbell, Home, Link2, Plane, Plus, Utensils, Waves, type LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { balancesFor, buildLedger, creditsForDistance, splitCredits } from "@/lib/balance";
import type { GroupView, Member, QuickRouteView, RedemptionView, TripView } from "@/lib/mock";
import { BalanceCard } from "./balance-card";
import { RedeemSheet, type NewRedemption } from "./redeem-sheet";
import { Timeline } from "./timeline";
import { TripSheet, type NewTrip } from "./trip-sheet";

const ICONS: Record<string, LucideIcon> = { home: Home, dumbbell: Dumbbell, waves: Waves, plane: Plane, car: Car };

type Props = {
  meId: string;
  groups: GroupView[];
  members: Member[];
  quickRoutes: QuickRouteView[];
  trips: TripView[];
  redemptions: RedemptionView[];
};

/**
 * Estado local sobre datos mock. Para conectar a la BD: sustituir `addTrip`,
 * `addRedemption` por Server Actions (+ `revalidatePath`) y pasar los datos desde
 * el Server Component `page.tsx` con queries de Drizzle.
 */
export function Dashboard(props: Props) {
  const { meId, groups, members } = props;
  const [groupId, setGroupId] = useState(groups[0].id);
  const [trips, setTrips] = useState(props.trips);
  const [redemptions, setRedemptions] = useState(props.redemptions);
  const [quickRoutes, setQuickRoutes] = useState(props.quickRoutes);
  const [tripSheet, setTripSheet] = useState<{ open: boolean; preset: QuickRouteView | null; n: number }>({ open: false, preset: null, n: 0 });
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const group = groups.find((g) => g.id === groupId)!;
  const ledger = useMemo(() => buildLedger(trips, redemptions), [trips, redemptions]);
  const pairs = useMemo(() => balancesFor(ledger, meId, members.map((m) => m.id)), [ledger, meId, members]);

  function addTrip(t: NewTrip) {
    const total = creditsForDistance(t.distanceKm, group.creditsPerKm);
    const split = splitCredits(total, t.passengerIds.length);
    setTrips((prev) => [
      {
        id: crypto.randomUUID(),
        driverId: t.driverId,
        title: t.title,
        distanceKm: t.distanceKm,
        totalCredits: total,
        passengers: t.passengerIds.map((id, i) => ({ passengerId: id, creditsOwed: split[i] })),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    if (t.saveAsQuickRoute) {
      setQuickRoutes((q) => [...q, { id: crypto.randomUUID(), name: t.title, distanceKm: t.distanceKm, creditsValue: total, icon: "car" }]);
    }
  }

  function addRedemption(r: NewRedemption) {
    setRedemptions((prev) => [
      { id: crypto.randomUUID(), fromUserId: meId, toUserId: r.toUserId, concept: r.concept, creditsRedeemed: r.credits, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  }

  async function copyInvite() {
    const url = `${window.location.origin}/invite/${group.inviteCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia el enlace de invitación", url);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="relative flex items-center justify-between">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface pl-4 pr-3 text-sm font-semibold"
        >
          <Car size={16} className="text-accent-text" />
          {group.name}
          <ChevronDown size={16} className="text-muted" />
        </button>
        <button onClick={copyInvite} className="flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium">
          {copied ? <Check size={16} className="text-positive" /> : <Link2 size={16} />}
          {copied ? "Copiado" : "Invitar"}
        </button>
        {menuOpen && (
          <ul className="absolute left-0 top-13 z-20 w-64 overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
            {groups.map((g) => (
              <li key={g.id}>
                <button
                  onClick={() => {
                    setGroupId(g.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-surface-2"
                >
                  {g.name}
                  {g.id === groupId && <Check size={16} className="text-accent-text" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </header>

      <BalanceCard pairs={pairs} members={members} threshold={group.rewardThreshold} />

      <section>
        <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wider text-muted">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickRoutes.map((q) => {
            const Icon = ICONS[q.icon] ?? Car;
            return (
              <button
                key={q.id}
                onClick={() => setTripSheet((s) => ({ open: true, preset: q, n: s.n + 1 }))}
                className="flex min-h-24 flex-col justify-between rounded-3xl border border-line bg-surface p-4 text-left transition active:scale-[.97] active:bg-surface-2"
              >
                <Icon size={20} className="text-muted" />
                <span>
                  <span className="block text-sm font-semibold leading-tight">{q.name}</span>
                  <span className="text-xs font-medium text-accent-text">+{q.creditsValue} cr.</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Timeline trips={trips} redemptions={redemptions} members={members} meId={meId} />

      <div className="fixed inset-x-0 bottom-0 z-30 bg-gradient-to-t from-bg via-bg/90 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <div className="mx-auto flex max-w-md gap-3">
          <button
            onClick={() => setTripSheet((s) => ({ open: true, preset: null, n: s.n + 1 }))}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.97]"
          >
            <Plus size={20} /> Trayecto
          </button>
          <button
            onClick={() => setRedeemOpen(true)}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface font-semibold transition active:scale-[.97]"
          >
            <Utensils size={18} /> Canjear
          </button>
        </div>
      </div>

      <TripSheet
        key={tripSheet.n}
        open={tripSheet.open}
        onClose={() => setTripSheet((s) => ({ ...s, open: false }))}
        members={members}
        meId={meId}
        creditsPerKm={group.creditsPerKm}
        preset={tripSheet.preset}
        onSubmit={addTrip}
      />
      <RedeemSheet
        key={`${redeemOpen}-${redemptions.length}`}
        open={redeemOpen}
        onClose={() => setRedeemOpen(false)}
        members={members}
        pairs={pairs}
        onSubmit={addRedemption}
      />
    </div>
  );
}
