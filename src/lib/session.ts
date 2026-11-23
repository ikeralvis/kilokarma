import "server-only";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { profiles, rewards, type Profile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { eq } from "drizzle-orm";

/** Usuario autenticado + su perfil (se crea en el primer acceso). `null` si no hay sesión. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const { data } = await auth().getSession();
  const user = data?.user;
  if (!user) return null;

  const existing = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  if (existing[0]) return existing[0];

  const name = user.name?.trim() || user.email.split("@")[0];
  await db
    .insert(profiles)
    .values({ userId: user.id, name, email: user.email.toLowerCase(), friendCode: randomBytes(6).toString("base64url") })
    .onConflictDoNothing();
  // Catálogo de canjes inicial (editable en la app).
  await db.insert(rewards).values([
    { ownerId: user.id, name: "Pintxo de tortilla", credits: 30 },
    { ownerId: user.id, name: "Ronda de cañas", credits: 70 },
    { ownerId: user.id, name: "Cena", credits: 200 },
  ]);
  const [created] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
  return created ?? null;
}

export async function requireProfile(next = "/"): Promise<Profile> {
  const p = await getCurrentProfile();
  if (!p) redirect(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  return p;
}
