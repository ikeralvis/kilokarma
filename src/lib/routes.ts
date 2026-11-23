import type { TripView } from "./types";

export const routeKey = (origin: string, destination: string) => `${origin.trim().toLowerCase()}→${destination.trim().toLowerCase()}`;

export type RouteGroup = {
  key: string;
  origin: string;
  destination: string;
  count: number;
  totalKm: number;
  totalCredits: number;
  /** Datos del último viaje, para sugerirlo tal cual. */
  distanceKm: number;
  driverId: string;
  passengerIds: string[];
  lastAt: string;
};

/** Agrupa trayectos con el mismo origen y destino; el último manda en los datos sugeridos. */
export function groupRoutes(trips: TripView[]): RouteGroup[] {
  const map = new Map<string, RouteGroup>();
  for (const t of [...trips].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const key = routeKey(t.origin, t.destination);
    const g = map.get(key);
    const base = { distanceKm: t.distanceKm, driverId: t.driverId, passengerIds: t.passengers.map((p) => p.passengerId), lastAt: t.createdAt, origin: t.origin, destination: t.destination };
    if (g) Object.assign(g, base, { count: g.count + 1, totalKm: g.totalKm + t.distanceKm, totalCredits: g.totalCredits + t.totalCredits });
    else map.set(key, { key, ...base, count: 1, totalKm: t.distanceKm, totalCredits: t.totalCredits });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.lastAt.localeCompare(a.lastAt));
}
