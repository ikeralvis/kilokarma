import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getDashboard } from "@/lib/data";
import { requireProfile } from "@/lib/session";

export default function Home() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Cargando…</div>}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  const me = await requireProfile("/coche");
  const data = await getDashboard(me);
  return (
    <main>
      <Dashboard data={data} />
    </main>
  );
}
