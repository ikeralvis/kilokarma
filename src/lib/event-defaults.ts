import type { EventKind } from "./types";

/** Tipos de ejemplo (editables). */
export const DEFAULT_EVENT_TYPES: { name: string; emoji: string; kind: EventKind; unit: string; xp: number }[] = [
  { name: "Restaurante", emoji: "🍽️", kind: "event", unit: "", xp: 10 },
  { name: "Cine", emoji: "🎬", kind: "event", unit: "", xp: 10 },
  { name: "Visita", emoji: "🏠", kind: "event", unit: "", xp: 8 },
  { name: "Viaje en avión", emoji: "✈️", kind: "counter", unit: "viajes", xp: 30 },
  { name: "Noches de hotel", emoji: "🏨", kind: "counter", unit: "noches", xp: 5 },
  { name: "Viaje de empresa", emoji: "💼", kind: "counter", unit: "viajes", xp: 15 },
];
