/** Valor por defecto de 1 crédito en € de combustible (parametrizable por conductor). */
export const DEFAULT_EUR_PER_CREDIT = 0.1;
/** Objetivo por defecto de la barra de progreso si no hay canjes definidos (créditos). */
export const DEFAULT_REWARD_GOAL = 30;

export function costPerKm(fuelPricePerL: number, consumptionL100: number): number {
  return (fuelPricePerL * consumptionL100) / 100;
}

export function tripCostEur(distanceKm: number, fuelPricePerL: number, consumptionL100: number): number {
  return Math.round(distanceKm * costPerKm(fuelPricePerL, consumptionL100) * 100) / 100;
}

/** Créditos de un viaje (mínimo 1 si hay distancia). */
export function creditsForTrip(
  distanceKm: number,
  fuelPricePerL: number,
  consumptionL100: number,
  eurPerCredit: number = DEFAULT_EUR_PER_CREDIT,
): number {
  const cost = distanceKm * costPerKm(fuelPricePerL, consumptionL100);
  return cost <= 0 || eurPerCredit <= 0 ? 0 : Math.max(1, Math.round(cost / eurPerCredit));
}
