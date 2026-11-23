import { eq } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { AcceptInvite } from "@/components/accept-invite";
import { requireProfile } from "@/lib/session";

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  return (
    <Suspense>
      <Inner params={params} />
    </Suspense>
  );
}

async function Inner({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const me = await requireProfile(`/invite/${code}`);
  const [owner] = await db.select({ name: profiles.name, userId: profiles.userId }).from(profiles).where(eq(profiles.friendCode, code)).limit(1);

  return (
    <main className="mx-auto grid min-h-dvh w-full max-w-sm content-center gap-6 px-5 text-center">
      {!owner ? (
        <p className="text-muted">Este enlace no es válido.</p>
      ) : owner.userId === me.userId ? (
        <p className="text-muted">Es tu propio enlace. Compártelo con un amigo.</p>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">{owner.name} quiere ser tu amigo en Recap</h1>
          <AcceptInvite code={code} />
        </>
      )}
    </main>
  );
}
