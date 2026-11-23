import "server-only";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { favorites, friendships, profiles, redemptions, tripPassengers, trips, type Profile } from "@/db/schema";
import type { DashboardData } from "./types";

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

  const [redemptionRows, favoriteRows] = await Promise.all([
    db
      .select()
      .from(redemptions)
      .where(or(eq(redemptions.fromUserId, uid), eq(redemptions.toUserId, uid)))
      .orderBy(desc(redemptions.createdAt))
      .limit(200),
    db.select().from(favorites).where(eq(favorites.ownerId, uid)).orderBy(desc(favorites.createdAt)),
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
    .select({ userId: profiles.userId, name: profiles.name, email: profiles.email, fuel: profiles.fuelPricePerL, cons: profiles.consumptionL100 })
    .from(profiles)
    .where(inArray(profiles.userId, [...ids]));
  const byId = new Map(people.map((p) => [p.userId, p]));
  const person = (id: string) => ({ id, name: byId.get(id)?.name ?? "Usuario" });

  return {
    me: { id: uid, name: me.name, friendCode: me.friendCode },
    vehicle: { fuelPricePerL: Number(me.fuelPricePerL), consumptionL100: Number(me.consumptionL100) },
    friends: friendIds.map((id) => ({
      ...person(id),
      email: byId.get(id)?.email ?? "",
      fuelPricePerL: Number(byId.get(id)?.fuel ?? 1.65),
      consumptionL100: Number(byId.get(id)?.cons ?? 6.5),
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
