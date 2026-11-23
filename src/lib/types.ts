export type Person = { id: string; name: string };

export type FriendView = Person & { email: string; hasCar: boolean; fuelPricePerL: number; consumptionL100: number; euroPerCredit: number };
export type PendingRequest = { id: string; from: Person };

export type TripView = {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  costEur: number;
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
export type FavoriteView = {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  friendId: string | null;
  driver: "me" | "friend";
};
export type RewardView = { id: string; name: string; credits: number };
export type VehicleView = { hasCar: boolean; fuelPricePerL: number; consumptionL100: number; euroPerCredit: number };

export type DashboardData = {
  me: Person & { friendCode: string };
  vehicle: VehicleView;
  friends: FriendView[];
  pending: PendingRequest[];
  /** Nombres de todos los que aparecen en viajes/canjeos (incluye antiguos amigos). */
  people: Person[];
  trips: TripView[];
  redemptions: RedemptionView[];
  favorites: FavoriteView[];
  rewards: RewardView[];
};
