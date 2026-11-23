import { Suspense } from "react";
import { RecapView } from "@/components/recap/recap-view";
import { getRecap } from "@/lib/data";
import { requireProfile } from "@/lib/session";

export default function Home() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Cargando…</div>}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  const me = await requireProfile("/");
  const data = await getRecap(me);
  return (
    <main>
      <RecapView data={data} />
    </main>
  );
}
