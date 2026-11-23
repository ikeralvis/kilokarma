import "server-only";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { eventParticipants, eventTypes, events, favorites, friendships, profiles, redemptions, rewards, tripPassengers, trips, type Profile } from "@/db/schema";
import type { DashboardData, RecapData } from "./types";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/** Amigos aceptados del usuario (ids). */
export async function friendIdsOf(userId: string): Promise<string[]> {
  const rows = await db
    .select()
    .from(friendships)
    .where(and(eq(friendships.status, "accepted"), or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId))));
  return rows.map((r) => (r.requesterId === userId ? r.addresseeId : r.requesterId));
}

export async function getDashboard(me: Profile): Promise<DashboardData> {
  const uid = me.userId;

  const [friendRows, pendingRows, myPassengerRows] = await Promise.all([
    db
      .select()
      .from(friendships)
      .where(and(eq(friendships.status, "accepted"), or(eq(friendships.requesterId, uid), eq(friendships.addresseeId, uid)))),
    db.select().from(friendships).where(and(eq(friendships.status, "pending"), eq(friendships.addresseeId, uid))),
    db.select({ tripId: tripPassengers.tripId }).from(tripPassengers).where(eq(tripPassengers.passengerId, uid)),
  ]);

  const tripRows = await db
    .select()
    .from(trips)
    .where(or(eq(trips.driverId, uid), inArray(trips.id, [NIL_UUID, ...myPassengerRows.map((r) => r.tripId)])))
    .orderBy(desc(trips.createdAt))
    .limit(200);
  const passengerRows = tripRows.length
    ? await db.select().from(tripPassengers).where(inArray(tripPassengers.tripId, tripRows.map((t) => t.id)))
    : [];

  const [redemptionRows, favoriteRows, rewardRows] = await Promise.all([
    db
      .select()
      .from(redemptions)
      .where(or(eq(redemptions.fromUserId, uid), eq(redemptions.toUserId, uid)))
      .orderBy(desc(redemptions.createdAt))
      .limit(200),
    db.select().from(favorites).where(eq(favorites.ownerId, uid)).orderBy(desc(favorites.createdAt)),
    db.select().from(rewards).where(eq(rewards.ownerId, uid)).orderBy(rewards.credits),
  ]);

  const friendIds = friendRows.map((r) => (r.requesterId === uid ? r.addresseeId : r.requesterId));
  const ids = new Set<string>([
    uid,
    ...friendIds,
    ...pendingRows.map((r) => r.requesterId),
    ...tripRows.map((t) => t.driverId),
    ...passengerRows.map((p) => p.passengerId),
    ...redemptionRows.flatMap((r) => [r.fromUserId, r.toUserId]),
  ]);
  const people = await db
    .select({ userId: profiles.userId, name: profiles.name, email: profiles.email, hasCar: profiles.hasCar, fuel: profiles.fuelPricePerL, cons: profiles.consumptionL100, epc: profiles.euroPerCredit })
    .from(profiles)
    .where(inArray(profiles.userId, [...ids]));
  const byId = new Map(people.map((p) => [p.userId, p]));
  const person = (id: string) => ({ id, name: byId.get(id)?.name ?? "Usuario" });

  return {
    me: { id: uid, name: me.name, friendCode: me.friendCode, accentColor: me.accentColor, onboarded: me.onboardedAt !== null },
    vehicle: { tripXp: me.tripXp, hasCar: me.hasCar, fuelPricePerL: Number(me.fuelPricePerL), consumptionL100: Number(me.consumptionL100), euroPerCredit: Number(me.euroPerCredit) },
    friends: friendIds.map((id) => ({
      ...person(id),
      email: byId.get(id)?.email ?? "",
      hasCar: byId.get(id)?.hasCar ?? true,
      fuelPricePerL: Number(byId.get(id)?.fuel ?? 1.65),
      consumptionL100: Number(byId.get(id)?.cons ?? 6.5),
      euroPerCredit: Number(byId.get(id)?.epc ?? 0.1),
    })),
    pending: pendingRows.map((r) => ({ id: r.id, from: person(r.requesterId) })),
    people: people.map((p) => ({ id: p.userId, name: p.name })),
    trips: tripRows.map((t) => ({
      id: t.id,
      driverId: t.driverId,
      origin: t.origin,
      destination: t.destination,
      distanceKm: Number(t.distanceKm),
      costEur: Number(t.costEur),
      xp: t.xp,
      totalCredits: t.totalCredits,
      passengers: passengerRows.filter((p) => p.tripId === t.id).map((p) => ({ passengerId: p.passengerId, creditsOwed: p.creditsOwed })),
      createdAt: t.createdAt.toISOString(),
    })),
    redemptions: redemptionRows.map((r) => ({
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      concept: r.concept,
      creditsRedeemed: r.creditsRedeemed,
      createdAt: r.createdAt.toISOString(),
    })),
    rewards: rewardRows.map((r) => ({ id: r.id, name: r.name, credits: r.credits })),
    favorites: favoriteRows.map((f) => ({
      id: f.id,
      name: f.name,
      origin: f.origin,
      destination: f.destination,
      distanceKm: Number(f.distanceKm),
      friendId: f.friendId,
      driver: f.driver === "friend" ? "friend" : "me",
    })),
  };
}

export async function getRecap(me: Profile): Promise<RecapData> {
  const dash = await getDashboard(me);
  const uid = me.userId;

  const mine = await db.select({ eventId: eventParticipants.eventId }).from(eventParticipants).where(eq(eventParticipants.userId, uid));
  const eventRows = await db
    .select()
    .from(events)
    .where(or(eq(events.createdBy, uid), inArray(events.id, [NIL_UUID, ...mine.map((m) => m.eventId)])))
    .orderBy(desc(events.occurredAt))
    .limit(300);
  const partRows = eventRows.length
    ? await db.select().from(eventParticipants).where(inArray(eventParticipants.eventId, eventRows.map((e) => e.id)))
    : [];
  const typeRows = await db.select().from(eventTypes).where(eq(eventTypes.ownerId, uid)).orderBy(eventTypes.createdAt);

  // Personas que salen en eventos y aún no están en la lista (p. ej. antiguos amigos).
  const known = new Set(dash.people.map((p) => p.id));
  const missing = [...new Set(partRows.map((p) => p.userId).concat(eventRows.map((e) => e.createdBy)))].filter((id) => !known.has(id));
  const extra = missing.length
    ? await db.select({ userId: profiles.userId, name: profiles.name }).from(profiles).where(inArray(profiles.userId, missing))
    : [];

  return {
    ...dash,
    people: [...dash.people, ...extra.map((p) => ({ id: p.userId, name: p.name }))],
    types: typeRows.map((t) => ({ id: t.id, name: t.name, emoji: t.emoji, kind: t.kind, scope: t.scope, unit: t.unit, xp: t.xp, subcategories: t.subcategories })),
    events: eventRows.map((e) => ({
      id: e.id,
      createdBy: e.createdBy,
      typeName: e.typeName,
      emoji: e.emoji,
      kind: e.kind,
      scope: e.scope,
      unit: e.unit,
      xpPerUnit: e.xpPerUnit,
      quantity: e.quantity,
      title: e.title,
      tag: e.tag,
      note: e.note,
      occurredAt: e.occurredAt.toISOString(),
      participantIds: partRows.filter((p) => p.eventId === e.id).map((p) => p.userId),
    })),
  };
}
