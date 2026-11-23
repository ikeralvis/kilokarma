"use server";

import { and, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { favorites, friendships, profiles, redemptions, rewards, tripPassengers, trips } from "@/db/schema";
import { splitCredits } from "@/lib/balance";
import { auth } from "@/lib/auth/server";
import { creditsForTrip, tripCostEur } from "@/lib/credits";
import { friendIdsOf } from "@/lib/data";
import { requireProfile } from "@/lib/session";

export type ActionResult = { ok: true } | { ok: false; error: string };
const fail = (error: string): ActionResult => ({ ok: false, error });
const done = (): ActionResult => {
  revalidatePath("/");
  return { ok: true };
};

/* ───────── Auth ───────── */

const credentials = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Email no válido")),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  name: z.string().trim().min(1, "Pon tu nombre").max(60).optional(),
});

function safeNext(next: unknown): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signInAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = credentials.omit({ name: true }).safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const { error } = await auth().signIn.email(parsed.data);
  if (error) return fail("Email o contraseña incorrectos");
  redirect(safeNext(fd.get("next")));
}

export async function signUpAction(_: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const parsed = credentials.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  const { error } = await auth().signUp.email({ ...parsed.data, name: parsed.data.name ?? parsed.data.email.split("@")[0] });
  if (error) return fail(error.message || "No se pudo crear la cuenta");
  redirect(safeNext(fd.get("next")));
}

export async function signOutAction() {
  await auth().signOut();
  redirect("/auth/sign-in");
}

/* ───────── Perfil y coche ───────── */

const profileSchema = z.object({
  name: z.string().trim().min(1, "Pon tu nombre").max(60),
  hasCar: z.boolean(),
  fuelPricePerL: z.number().min(0.3).max(5),
  consumptionL100: z.number().min(1).max(30),
});

export async function updateProfile(input: z.infer<typeof profileSchema>): Promise<ActionResult> {
  const me = await requireProfile();
  const p = profileSchema.safeParse(input);
  if (!p.success) return fail("Revisa nombre, precio y consumo");
  await db
    .update(profiles)
    .set({
      name: p.data.name,
      hasCar: p.data.hasCar,
      fuelPricePerL: p.data.fuelPricePerL.toFixed(3),
      consumptionL100: p.data.consumptionL100.toFixed(2),
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, me.userId));
  return done();
}

/* ───────── Amigos ───────── */

async function findFriendship(a: string, b: string) {
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, a), eq(friendships.addresseeId, b)),
        and(eq(friendships.requesterId, b), eq(friendships.addresseeId, a)),
      ),
    )
    .limit(1);
  return row;
}

export async function sendFriendRequest(emailRaw: string): Promise<ActionResult> {
  const me = await requireProfile();
  const email = z.email().safeParse(emailRaw.trim().toLowerCase());
  if (!email.success) return fail("Email no válido");
  const [target] = await db.select().from(profiles).where(eq(profiles.email, email.data)).limit(1);
  if (!target || target.userId === me.userId) return fail("No encontramos a nadie con ese email (¿ya se ha registrado?)");
  const existing = await findFriendship(me.userId, target.userId);
  if (existing?.status === "accepted") return fail("Ya sois amigos");
  if (existing) {
    // Si la solicitud ya venía de la otra persona, se acepta.
    if (existing.addresseeId === me.userId) await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, existing.id));
    return done();
  }
  await db.insert(friendships).values({ requesterId: me.userId, addresseeId: target.userId });
  return done();
}

export async function respondFriendRequest(id: string, accept: boolean): Promise<ActionResult> {
  const me = await requireProfile();
  const cond = and(eq(friendships.id, id), eq(friendships.addresseeId, me.userId), eq(friendships.status, "pending"));
  if (accept) await db.update(friendships).set({ status: "accepted" }).where(cond);
  else await db.delete(friendships).where(cond);
  return done();
}

export async function removeFriend(friendId: string): Promise<ActionResult> {
  const me = await requireProfile();
  const f = await findFriendship(me.userId, friendId);
  if (f) await db.delete(friendships).where(eq(friendships.id, f.id));
  return done();
}

/** Aceptar por enlace /invite/[code]: ambas partes consienten (uno comparte, otro abre). */
export async function acceptInvite(code: string): Promise<ActionResult> {
  const me = await requireProfile(`/invite/${code}`);
  const [owner] = await db.select().from(profiles).where(eq(profiles.friendCode, code)).limit(1);
  if (!owner) return fail("Enlace no válido");
  if (owner.userId === me.userId) return fail("Es tu propio enlace");
  const existing = await findFriendship(me.userId, owner.userId);
  if (existing) await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, existing.id));
  else await db.insert(friendships).values({ requesterId: owner.userId, addresseeId: me.userId, status: "accepted" });
  return done();
}

/* ───────── Viajes ───────── */

const tripSchema = z.object({
  origin: z.string().trim().max(80),
  destination: z.string().trim().min(1, "Falta el destino").max(80),
  distanceKm: z.number().positive("Km no válidos").max(5000),
  driverId: z.string().min(1),
  passengerIds: z.array(z.string()).min(1, "Marca al menos un acompañante").max(8),
  /** Precio del combustible usado (€/l); se guarda para el siguiente viaje. */
  fuelPricePerL: z.number().min(0.3).max(5),
  saveFavorite: z.string().trim().max(40).optional(),
});

export async function addTrip(input: z.input<typeof tripSchema>): Promise<ActionResult> {
  const me = await requireProfile();
  const p = tripSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  const t = p.data;

  const passengerIds = [...new Set(t.passengerIds)].filter((id) => id !== t.driverId);
  if (passengerIds.length === 0) return fail("Conductor y acompañante no pueden ser la misma persona");
  const participants = [t.driverId, ...passengerIds];
  if (!participants.includes(me.userId)) return fail("Tienes que ir en el viaje");

  const friends = new Set(await friendIdsOf(me.userId));
  if (participants.some((id) => id !== me.userId && !friends.has(id))) return fail("Solo puedes añadir a tus amigos");

  const [driver] = await db.select().from(profiles).where(eq(profiles.userId, t.driverId)).limit(1);
  if (!driver) return fail("Conductor no encontrado");
  if (!driver.hasCar) return fail(`${driver.name} no tiene coche`);
  const consumption = Number(driver.consumptionL100);

  const credits = creditsForTrip(t.distanceKm, t.fuelPricePerL, consumption);
  const split = splitCredits(credits, passengerIds.length);
  const tripId = crypto.randomUUID();

  await db.batch([
    db.insert(trips).values({
      id: tripId,
      createdBy: me.userId,
      driverId: t.driverId,
      origin: t.origin,
      destination: t.destination,
      distanceKm: t.distanceKm.toFixed(2),
      fuelPricePerL: t.fuelPricePerL.toFixed(3),
      consumptionL100: consumption.toFixed(2),
      costEur: tripCostEur(t.distanceKm, t.fuelPricePerL, consumption).toFixed(2),
      totalCredits: credits,
    }),
    db.insert(tripPassengers).values(passengerIds.map((id, i) => ({ tripId, passengerId: id, creditsOwed: split[i] }))),
    // El precio queda guardado en el perfil del conductor para el siguiente viaje.
    db.update(profiles).set({ fuelPricePerL: t.fuelPricePerL.toFixed(3), updatedAt: new Date() }).where(eq(profiles.userId, t.driverId)),
  ]);

  if (t.saveFavorite) {
    const other = participants.find((id) => id !== me.userId) ?? null;
    await db.insert(favorites).values({
      ownerId: me.userId,
      name: t.saveFavorite,
      origin: t.origin,
      destination: t.destination,
      distanceKm: t.distanceKm.toFixed(2),
      friendId: other,
      driver: t.driverId === me.userId ? "me" : "friend",
    });
  }
  return done();
}

export async function deleteTrip(id: string): Promise<ActionResult> {
  const me = await requireProfile();
  await db.delete(trips).where(and(eq(trips.id, id), eq(trips.createdBy, me.userId)));
  return done();
}

/* ───────── Favoritos ───────── */

export async function deleteFavorite(id: string): Promise<ActionResult> {
  const me = await requireProfile();
  await db.delete(favorites).where(and(eq(favorites.id, id), eq(favorites.ownerId, me.userId)));
  return done();
}

/* ───────── Catálogo de canjes ───────── */

const rewardSchema = z.object({
  name: z.string().trim().min(1, "Pon un nombre").max(40),
  credits: z.number().int().positive().max(100000),
});

export async function addReward(input: z.input<typeof rewardSchema>): Promise<ActionResult> {
  const me = await requireProfile();
  const p = rewardSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  await db.insert(rewards).values({ ownerId: me.userId, ...p.data });
  return done();
}

export async function deleteReward(id: string): Promise<ActionResult> {
  const me = await requireProfile();
  await db.delete(rewards).where(and(eq(rewards.id, id), eq(rewards.ownerId, me.userId)));
  return done();
}

/* ───────── Canjeos ───────── */

const redeemSchema = z.object({
  toUserId: z.string().min(1),
  concept: z.string().trim().min(1, "Falta el concepto").max(80),
  credits: z.number().int().positive().max(100000),
});

export async function redeem(input: z.input<typeof redeemSchema>): Promise<ActionResult> {
  const me = await requireProfile();
  const p = redeemSchema.safeParse(input);
  if (!p.success) return fail(p.error.issues[0].message);
  if (!(await friendIdsOf(me.userId)).includes(p.data.toUserId)) return fail("Solo puedes invitar a tus amigos");
  await db.insert(redemptions).values({ fromUserId: me.userId, toUserId: p.data.toUserId, concept: p.data.concept, creditsRedeemed: p.data.credits });
  return done();
}
