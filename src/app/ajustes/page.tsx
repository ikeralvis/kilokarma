import { Suspense } from "react";
import { SettingsView } from "@/components/settings/settings-view";
import { getRecap } from "@/lib/data";
import { requireProfile } from "@/lib/session";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Cargando…</div>}>
      <Data />
    </Suspense>
  );
}

async function Data() {
  const me = await requireProfile("/ajustes");
  const data = await getRecap(me);
  return (
    <main>
      <SettingsView data={data} />
    </main>
  );
}
