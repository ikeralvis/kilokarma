import { relations } from "drizzle-orm";
import {
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

export const memberRole = pgEnum("member_role", ["admin", "member"]);

/** Better Auth gestiona sus propias tablas (session/account/verification);
 *  `users` es la tabla de usuario que le pasamos al adapter de Drizzle. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified").default(0).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  /** Factor de conversión km → créditos. */
  defaultCreditsPerKm: numeric("default_credits_per_km", { precision: 6, scale: 2 })
    .default("1")
    .notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: memberRole("role").default("member").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("group_members_unique").on(t.groupId, t.userId)],
);

export const quickRoutes = pgTable("quick_routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  distanceKm: numeric("distance_km", { precision: 8, scale: 2 }).notNull(),
  creditsValue: integer("credits_value").notNull(),
  icon: text("icon").default("car").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const trips = pgTable(
  "trips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    distanceKm: numeric("distance_km", { precision: 8, scale: 2 }).notNull(),
    totalCredits: integer("total_credits").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("trips_group_created_idx").on(t.groupId, t.createdAt)],
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
      .references(() => users.id),
    /** Créditos que este pasajero suma a favor del conductor. */
    creditsOwed: integer("credits_owed").notNull(),
  },
  (t) => [uniqueIndex("trip_passengers_unique").on(t.tripId, t.passengerId)],
);

export const redemptions = pgTable(
  "redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    /** Quien invita (el que debía créditos). */
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => users.id),
    /** El conductor al que se invita. */
    toUserId: text("to_user_id")
      .notNull()
      .references(() => users.id),
    concept: text("concept").notNull(),
    creditsRedeemed: integer("credits_redeemed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("redemptions_group_created_idx").on(t.groupId, t.createdAt)],
);

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  quickRoutes: many(quickRoutes),
  trips: many(trips),
  redemptions: many(redemptions),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  group: one(groups, { fields: [trips.groupId], references: [groups.id] }),
  driver: one(users, { fields: [trips.driverId], references: [users.id] }),
  passengers: many(tripPassengers),
}));

export const tripPassengersRelations = relations(tripPassengers, ({ one }) => ({
  trip: one(trips, { fields: [tripPassengers.tripId], references: [trips.id] }),
  passenger: one(users, { fields: [tripPassengers.passengerId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type GroupMember = typeof groupMembers.$inferSelect;
export type QuickRoute = typeof quickRoutes.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type TripPassenger = typeof tripPassengers.$inferSelect;
export type Redemption = typeof redemptions.$inferSelect;
