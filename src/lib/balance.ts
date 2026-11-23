/**
 * Lógica pura de balances (sin acceso a BD) → testeable y reutilizable
 * tanto en Server Components como en Server Actions.
 *
 * Convención: cada entrada del libro mayor dice "debtor le debe `amount` a creditor".
 *  - Trayecto: cada pasajero le debe `creditsOwed` al conductor.
 *  - Canjeo: `fromUser` (quien invita) salda `credits` de su deuda con `toUser` (conductor).
 *    Se modela como deuda negativa.
 */

export type LedgerEntry = { debtorId: string; creditorId: string; amount: number };

export type TripInput = {
  driverId: string;
  passengers: { passengerId: string; creditsOwed: number }[];
};
export type RedemptionInput = {
  fromUserId: string;
  toUserId: string;
  creditsRedeemed: number;
};

/** Reparte `total` créditos enteros entre n pasajeros sin perder ni inventar créditos. */
export function splitCredits(total: number, n: number): number[] {
  if (n <= 0) return [];
  const base = Math.floor(total / n);
  const remainder = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function creditsForDistance(distanceKm: number, creditsPerKm: number): number {
  return Math.max(0, Math.round(distanceKm * creditsPerKm));
}

export function buildLedger(trips: TripInput[], redemptions: RedemptionInput[]): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  for (const t of trips) {
    for (const p of t.passengers) {
      if (p.passengerId === t.driverId) continue;
      entries.push({ debtorId: p.passengerId, creditorId: t.driverId, amount: p.creditsOwed });
    }
  }
  for (const r of redemptions) {
    entries.push({ debtorId: r.fromUserId, creditorId: r.toUserId, amount: -r.creditsRedeemed });
  }
  return entries;
}

/**
 * Saldo neto entre `me` y `other`.
 * > 0 → `other` me debe créditos · < 0 → yo le debo a `other` · 0 → en paz.
 */
export function netBalance(ledger: LedgerEntry[], me: string, other: string): number {
  let net = 0;
  for (const e of ledger) {
    if (e.creditorId === me && e.debtorId === other) net += e.amount;
    else if (e.creditorId === other && e.debtorId === me) net -= e.amount;
  }
  return net;
}

export type PairBalance = { userId: string; net: number };

/** Saldo de `me` contra cada uno de los demás miembros. */
export function balancesFor(ledger: LedgerEntry[], me: string, memberIds: string[]): PairBalance[] {
  return memberIds
    .filter((id) => id !== me)
    .map((userId) => ({ userId, net: netBalance(ledger, me, userId) }));
}

/** Saldo global del usuario en el grupo (suma de todos sus pares). */
export function totalBalance(pairs: PairBalance[]): number {
  return pairs.reduce((acc, p) => acc + p.net, 0);
}

/** Progreso (0‑1) y nº de recompensas completas disponibles dado un umbral. */
export function rewardProgress(credits: number, threshold: number) {
  const abs = Math.abs(credits);
  return {
    rewards: Math.floor(abs / threshold),
    progress: (abs % threshold) / threshold,
    remaining: threshold - (abs % threshold),
  };
}
