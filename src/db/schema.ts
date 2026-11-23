import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Los usuarios los gestiona Neon Auth (esquema `neon_auth`). Aquí guardamos su id como
 * texto (sin FK entre esquemas) y un `profile` con nombre, email y datos del coche.
 */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  /** Código para el enlace de amistad /invite/[code]. */
  friendCode: text("friend_code").notNull().unique(),
  /** ¿Tiene coche? Si no, nunca aparece como conductor. */
  hasCar: boolean("has_car").default(true).notNull(),
  /** Último precio del combustible introducido (€/l). Se reutiliza en el siguiente viaje. */
  fuelPricePerL: numeric("fuel_price_per_l", { precision: 6, scale: 3 }).default("1.650").notNull(),
  /** Valor de 1 crédito en € de combustible (al conducir tú). */
  euroPerCredit: numeric("euro_per_credit", { precision: 5, scale: 3 }).default("0.100").notNull(),
  /** Consumo del coche (l/100 km). */
  consumptionL100: numeric("consumption_l100", { precision: 5, scale: 2 }).default("6.50").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const friendStatus = pgEnum("friend_status", ["pending", "accepted"]);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: text("requester_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    addresseeId: text("addressee_id")
      .notNull()
      .references(() => profiles.userId, { onDelete: "cascade" }),
    status: friendStatus("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("friendships_pair_unique").on(t.requesterId, t.addresseeId)],
);

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdBy: text("created_by")
      .notNull()
      .references(() => profiles.userId),
    driverId: text("driver_id")
      .notNull()
      .references(() => profiles.userId),
    origin: text("origin").notNull().default(""),
    destination: text("destination").notNull(),
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }).notNull(),
    /** Foto del precio y consumo usados: los viajes antiguos no se recalculan. */
    fuelPricePerL: numeric("fuel_price_per_l", { precision: 6, scale: 3 }).notNull(),
    consumptionL100: numeric("consumption_l100", { precision: 5, scale: 2 }).notNull(),
    costEur: numeric("cost_eur", { precision: 8, scale: 2 }).notNull(),
    totalCredits: integer("total_credits").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("trips_driver_idx").on(t.driverId), index("trips_created_idx").on(t.createdAt)],
);

export const tripPassengers = pgTable(
  "trip_passengers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tripId: uuid("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    passengerId: text("passenger_id")
      .notNull()
      .references(() => profiles.userId),
    /** Créditos que este pasajero suma a favor del conductor. */
    creditsOwed: integer("credits_owed").notNull(),
  },
  (t) => [
    uniqueIndex("trip_passengers_unique").on(t.tripId, t.passengerId),
    index("trip_passengers_passenger_idx").on(t.passengerId),
  ],
);

/** Viajes favoritos: plantillas personales para registrar con un toque. */
export const favorites = pgTable("favorites", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  origin: text("origin").notNull().default(""),
  destination: text("destination").notNull(),
  distanceKm: numeric("distance_km", { precision: 8, scale: 2 }).notNull(),
  /** Amigo habitual en este trayecto (opcional). */
  friendId: text("friend_id").references(() => profiles.userId, { onDelete: "set null" }),
  /** Quién suele conducir: 'me' o 'friend'. */
  driver: text("driver").default("me").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Catálogo personal de cosas en las que canjear créditos (pintxo, cena…). */
export const rewards = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => profiles.userId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  credits: integer("credits").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const redemptions = pgTable(
  "redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Quien invita (el que debía créditos). */
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => profiles.userId),
    /** El conductor al que se invita. */
    toUserId: text("to_user_id")
      .notNull()
      .references(() => profiles.userId),
    concept: text("concept").notNull(),
    creditsRedeemed: integer("credits_redeemed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("redemptions_from_idx").on(t.fromUserId), index("redemptions_to_idx").on(t.toUserId)],
);

export type Profile = typeof profiles.$inferSelect;
