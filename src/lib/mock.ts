/** Datos de ejemplo para validar la UI. Misma forma que las filas de Drizzle
 *  (con `createdAt` como ISO string) para poder sustituirlos por queries reales. */

export type Member = { id: string; name: string; image: string | null; role: "admin" | "member" };
export type QuickRouteView = {
  id: string;
  name: string;
  distanceKm: number;
  creditsValue: number;
  icon: string;
};
export type TripView = {
  id: string;
  driverId: string;
  title: string;
  distanceKm: number;
  totalCredits: number;
  passengers: { passengerId: string; creditsOwed: number }[];
  createdAt: string;
};
export type RedemptionView = {
  id: string;
  fromUserId: string;
  toUserId: string;
  concept: string;
  creditsRedeemed: number;
  createdAt: string;
};
export type GroupView = {
  id: string;
  name: string;
  inviteCode: string;
  creditsPerKm: number;
  rewardThreshold: number;
};

export const ME = "u-me";

export const mockMembers: Member[] = [
  { id: "u-me", name: "Iker", image: null, role: "admin" },
  { id: "u-ana", name: "Ana", image: null, role: "member" },
  { id: "u-leo", name: "Leo", image: null, role: "member" },
  { id: "u-mar", name: "Marta", image: null, role: "member" },
];

export const mockGroups: GroupView[] = [
  { id: "g1", name: "Coche de Ana", inviteCode: "ana-4f9k2x", creditsPerKm: 1, rewardThreshold: 50 },
  { id: "g2", name: "Finde en la sierra", inviteCode: "sierra-7q1m8d", creditsPerKm: 1.5, rewardThreshold: 50 },
];

export const mockQuickRoutes: QuickRouteView[] = [
  { id: "q1", name: "Vuelta a casa", distanceKm: 15, creditsValue: 15, icon: "home" },
  { id: "q2", name: "Ir al gym", distanceKm: 8, creditsValue: 8, icon: "dumbbell" },
  { id: "q3", name: "Centro ↔ playa", distanceKm: 22, creditsValue: 22, icon: "waves" },
  { id: "q4", name: "Aeropuerto", distanceKm: 38, creditsValue: 38, icon: "plane" },
];

const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const mockTrips: TripView[] = [
  { id: "t1", driverId: "u-ana", title: "Vuelta a casa", distanceKm: 15, totalCredits: 15, passengers: [{ passengerId: "u-me", creditsOwed: 15 }], createdAt: ago(3) },
  { id: "t2", driverId: "u-ana", title: "Aeropuerto", distanceKm: 38, totalCredits: 38, passengers: [{ passengerId: "u-me", creditsOwed: 19 }, { passengerId: "u-leo", creditsOwed: 19 }], createdAt: ago(30) },
  { id: "t3", driverId: "u-me", title: "Ir al gym", distanceKm: 8, totalCredits: 8, passengers: [{ passengerId: "u-leo", creditsOwed: 4 }, { passengerId: "u-mar", creditsOwed: 4 }], createdAt: ago(52) },
  { id: "t4", driverId: "u-leo", title: "Cena en Getxo", distanceKm: 26, totalCredits: 26, passengers: [{ passengerId: "u-me", creditsOwed: 13 }, { passengerId: "u-mar", creditsOwed: 13 }], createdAt: ago(76) },
  { id: "t5", driverId: "u-me", title: "Centro ↔ playa", distanceKm: 22, totalCredits: 22, passengers: [{ passengerId: "u-ana", creditsOwed: 11 }, { passengerId: "u-mar", creditsOwed: 11 }], createdAt: ago(120) },
  { id: "t6", driverId: "u-ana", title: "Montaña", distanceKm: 64, totalCredits: 64, passengers: [{ passengerId: "u-me", creditsOwed: 32 }, { passengerId: "u-mar", creditsOwed: 32 }], createdAt: ago(200) },
];

export const mockRedemptions: RedemptionView[] = [
  { id: "r1", fromUserId: "u-me", toUserId: "u-ana", concept: "Dos rondas de cañas", creditsRedeemed: 30, createdAt: ago(40) },
  { id: "r2", fromUserId: "u-mar", toUserId: "u-me", concept: "Café", creditsRedeemed: 4, createdAt: ago(60) },
];
