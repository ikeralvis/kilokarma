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
  fuelPricePerL: number;
  createdBy: string;
  xp: number;
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
  status: "pending" | "confirmed";
  /** Quién lo propuso; confirma la otra persona. */
  requestedBy: string;
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
/** Canje de la lista de alguien (`ownerId` = quien cobra y pone el precio). */
export type RewardView = { id: string; ownerId: string; name: string; credits: number };
export type VehicleView = { tripXp: number; hasCar: boolean; fuelPricePerL: number; consumptionL100: number; euroPerCredit: number };

export type DashboardData = {
  me: Person & { friendCode: string; accentColor: string; onboarded: boolean };
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

export type EventKind = "event" | "counter";
export type EventScope = "individual" | "group";
export type EventTypeView = {
  id: string;
  /** Quién la creó (las categorías se comparten entre amigos). */
  ownerId: string;
  ownerName: string;
  name: string;
  emoji: string;
  kind: EventKind;
  scope: EventScope;
  unit: string;
  xp: number;
  subcategories: string[];
};
export type EventView = {
  id: string;
  createdBy: string;
  typeName: string;
  emoji: string;
  kind: EventKind;
  scope: EventScope;
  unit: string;
  xpPerUnit: number;
  quantity: number;
  title: string;
  tag: string;
  note: string | null;
  occurredAt: string;
  participantIds: string[];
};
export type RecapData = DashboardData & { types: EventTypeView[]; events: EventView[] };
