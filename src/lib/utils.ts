export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function timeAgo(iso: string, now: number): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d === 1 ? "ayer" : `hace ${d} días`;
}

export function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase();
}

export function fmtCredits(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** «viajes» → «viaje» cuando la cantidad es 1 (las unidades se guardan en plural). */
export function unitFor(unit: string, n: number) {
  return n === 1 && unit.endsWith("s") ? unit.slice(0, -1) : unit;
}
