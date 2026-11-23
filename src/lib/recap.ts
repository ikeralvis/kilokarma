import type { EventScope, EventView, Person, TripView } from "./types";

/** Medallas por XP total. */
export const TIERS = [
  { xp: 0, icon: "🌱", name: "Recién llegados" },
  { xp: 50, icon: "🥉", name: "Bronce" },
  { xp: 200, icon: "🥈", name: "Plata" },
  { xp: 500, icon: "🥇", name: "Oro" },
  { xp: 1200, icon: "🏆", name: "Copa" },
  { xp: 3000, icon: "💎", name: "Diamante" },
] as const;

export function tierFor(xp: number) {
  let i = 0;
  while (i + 1 < TIERS.length && xp >= TIERS[i + 1].xp) i++;
  const next = TIERS[i + 1];
  return {
    tier: TIERS[i],
    next: next ?? null,
    progress: next ? (xp - TIERS[i].xp) / (next.xp - TIERS[i].xp) : 1,
  };
}

export const eventXp = (e: EventView) => e.xpPerUnit * e.quantity;

/** XP total por usuario: registros del diario + un XP fijo por cada trayecto en coche. */
export function xpByUser(events: EventView[], trips: TripView[]): Map<string, number> {
  const xp = new Map<string, number>();
  const add = (id: string, n: number) => xp.set(id, (xp.get(id) ?? 0) + n);
  for (const e of events) for (const id of e.participantIds) add(id, eventXp(e));
  for (const t of trips) {
    add(t.driverId, t.xp);
    for (const p of t.passengers) add(p.passengerId, t.xp);
  }
  return xp;
}

export type SubStat = { name: string; total: number; perUser: Map<string, number> };

export type TypeStat = {
  key: string;
  name: string;
  emoji: string;
  unit: string;
  scope: EventScope;
  /** Total (suma de cantidades) por usuario. */
  totals: Map<string, number>;
  /** Cantidad hecha juntos (≥2 de los presentes). */
  together: number;
  /** Quién va en cabeza (null si hay empate o no hay datos). */
  leaderId: string | null;
  sum: number;
  /** Desglose por subcategoría, de más a menos. */
  subs: SubStat[];
};

/** Estadísticas por tipo (agrupadas por nombre, así se comparan entre amigos). */
export function statsByType(events: EventView[], ids: string[]): TypeStat[] {
  const idSet = new Set(ids);
  const map = new Map<string, TypeStat & { subMap: Map<string, SubStat> }>();
  for (const e of events) {
    const key = e.typeName.trim().toLowerCase();
    let s = map.get(key);
    if (!s) {
      s = { key, name: e.typeName, emoji: e.emoji, unit: e.unit, scope: e.scope, totals: new Map(), together: 0, leaderId: null, sum: 0, subs: [], subMap: new Map() };
      map.set(key, s);
    }
    const present = e.participantIds.filter((id) => idSet.has(id));
    for (const id of present) s.totals.set(id, (s.totals.get(id) ?? 0) + e.quantity);
    if (present.length >= 2) s.together += e.quantity;
    s.sum += e.quantity * present.length;

    const sub = e.tag.trim();
    if (sub) {
      const k = sub.toLowerCase();
      let st = s.subMap.get(k);
      if (!st) {
        st = { name: sub, total: 0, perUser: new Map() };
        s.subMap.set(k, st);
      }
      st.total += e.quantity;
      for (const id of present) st.perUser.set(id, (st.perUser.get(id) ?? 0) + e.quantity);
    }
  }
  const out: TypeStat[] = [];
  for (const s of map.values()) {
    const sorted = [...s.totals.entries()].sort((a, b) => b[1] - a[1]);
    s.leaderId = sorted.length > 0 && (sorted.length === 1 || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : null;
    s.subs = [...s.subMap.values()].sort((a, b) => b.total - a.total);
    out.push(s);
  }
  return out.sort((a, b) => b.sum - a.sum);
}

/** Viajes en coche por persona (como conductor o acompañante) y km. */
export function carStats(trips: TripView[]) {
  const count = new Map<string, number>();
  const km = new Map<string, number>();
  const add = (m: Map<string, number>, id: string, n: number) => m.set(id, (m.get(id) ?? 0) + n);
  for (const t of trips) {
    for (const id of [t.driverId, ...t.passengers.map((p) => p.passengerId)]) {
      add(count, id, 1);
      add(km, id, t.distanceKm);
    }
  }
  return { count, km };
}

export const nameOf = (people: Person[], meId: string, id: string) => (id === meId ? "Tú" : (people.find((p) => p.id === id)?.name ?? "?"));
