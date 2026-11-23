import type { EventKind, EventScope } from "./types";

export type DefaultType = {
  name: string;
  emoji: string;
  kind: EventKind;
  scope: EventScope;
  unit: string;
  xp: number;
  subcategories: string[];
};

/** Tipos de ejemplo (editables en Ajustes). */
export const DEFAULT_EVENT_TYPES: DefaultType[] = [
  { name: "Restaurante", emoji: "🍽️", kind: "event", scope: "group", unit: "", xp: 10, subcategories: ["Mexicano", "Fast food", "Japonés", "Italiano", "Pintxos", "Mediterráneo"] },
  { name: "Cine", emoji: "🎬", kind: "event", scope: "group", unit: "", xp: 10, subcategories: [] },
  { name: "Visita", emoji: "🏠", kind: "event", scope: "group", unit: "", xp: 8, subcategories: [] },
  { name: "Viaje en avión", emoji: "✈️", kind: "counter", scope: "individual", unit: "viajes", xp: 30, subcategories: [] },
  { name: "Noches de hotel", emoji: "🏨", kind: "counter", scope: "individual", unit: "noches", xp: 5, subcategories: [] },
  { name: "Viaje de empresa", emoji: "💼", kind: "counter", scope: "individual", unit: "viajes", xp: 15, subcategories: [] },
];
