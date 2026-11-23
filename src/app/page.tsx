import { redirect } from "next/navigation";
import { Suspense } from "react";
import { RecapView } from "@/components/recap/recap-view";
import { Logo } from "@/components/brand/logo";
import { getRecap } from "@/lib/data";
import { getCurrentProfile } from "@/lib/session";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-dvh place-items-center">
          <Logo size={72} className="animate-pulse rounded-2xl" />
        </div>
      }
    >
      <Data />
    </Suspense>
  );
}

async function Data() {
  // Sin sesión → portada pública; con sesión → el Recap.
  const me = await getCurrentProfile();
  if (!me) redirect("/welcome");
  const data = await getRecap(me);
  return (
    <main>
      <RecapView data={data} />
    </main>
  );
}
