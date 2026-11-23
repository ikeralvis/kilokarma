/** 1 crédito = 0,10 € de combustible. */
export const EUR_PER_CREDIT = 0.1;
/** Umbral de recompensa sugerida (créditos). */
export const REWARD_THRESHOLD = 50;

export function costPerKm(fuelPricePerL: number, consumptionL100: number): number {
  return (fuelPricePerL * consumptionL100) / 100;
}

export function tripCostEur(distanceKm: number, fuelPricePerL: number, consumptionL100: number): number {
  return Math.round(distanceKm * costPerKm(fuelPricePerL, consumptionL100) * 100) / 100;
}

/** Créditos de un viaje (mínimo 1 si hay distancia). */
export function creditsForTrip(distanceKm: number, fuelPricePerL: number, consumptionL100: number): number {
  const cost = distanceKm * costPerKm(fuelPricePerL, consumptionL100);
  return cost <= 0 ? 0 : Math.max(1, Math.round(cost / EUR_PER_CREDIT));
}
