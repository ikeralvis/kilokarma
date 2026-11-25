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

/** Canjes de ejemplo: experiencias y favores en vez de cosas (cada uno pone sus precios). */
export const EXPERIENCES: { name: string; credits: number }[] = [
  { name: "DJ en el coche un viaje entero", credits: 15 },
  { name: "Fotos guapas para Instagram", credits: 30 },
  { name: "Tú eliges el plan del sábado", credits: 40 },
  { name: "Lavar el coche", credits: 60 },
  { name: "Plan sorpresa", credits: 80 },
  { name: "Masaje de 15 minutos", credits: 50 },
  { name: "Un día sin quejas", credits: 70 },
  { name: "Llevarme al aeropuerto", credits: 100 },
  { name: "Cocinarme una cena", credits: 120 },
];
