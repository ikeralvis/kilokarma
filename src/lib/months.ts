const TZ = "Europe/Madrid";
const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
const label = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });

/** Clave de mes «YYYY-MM» en hora de Madrid. */
export function monthKey(d: string | number | Date): string {
  const p = parts.formatToParts(new Date(d));
  const y = p.find((x) => x.type === "year")?.value ?? "0000";
  const m = p.find((x) => x.type === "month")?.value ?? "00";
  return `${y}-${m}`;
}

/** «noviembre 2026». */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const s = label.format(new Date(Date.UTC(y, m - 1, 1)));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Meses distintos presentes en las fechas, del más reciente al más antiguo. */
export function monthsOf(dates: string[]): string[] {
  return [...new Set(dates.map(monthKey))].sort().reverse();
}
