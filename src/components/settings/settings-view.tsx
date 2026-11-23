"use client";

import { ArrowLeft, LogOut, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setOnboarded, signOutAction } from "@/app/actions";
import { InstallCard } from "@/components/install-card";
import { useRun } from "@/components/use-run";
import { AutoRefresh } from "@/components/auto-refresh";
import { ThemeSync } from "@/components/theme-toggle";
import type { RecapData } from "@/lib/types";
import { AppearanceSection } from "./appearance-section";
import { Card } from "./card";
import { FriendsSection } from "./friends-section";
import { ProfileSection } from "./profile-section";
import { RewardsSection } from "./rewards-section";
import { TypesSection } from "./types-section";

const NAV = [
  ["perfil", "Perfil"],
  ["coche", "Coche"],
  ["apariencia", "Apariencia"],
  ["categorias", "Categorías"],
  ["canjes", "Canjes"],
  ["amigos", "Amigos"],
  ["app", "App"],
];

export function SettingsView({ data }: { data: RecapData }) {
  const { me } = data;
  const router = useRouter();
  const { run, pending } = useRun();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-5 px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-center gap-3">
        <Link href="/" aria-label="Volver" className="grid size-11 place-items-center rounded-full border border-line bg-surface">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">Ajustes</h1>
      </header>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Secciones de ajustes">
        {NAV.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full bg-surface-2 px-4 py-2 text-sm font-medium">
            {label}
            {id === "amigos" && data.pending.length > 0 ? ` (${data.pending.length})` : ""}
          </a>
        ))}
      </nav>

      <ProfileSection me={me} vehicle={data.vehicle} accent={me.accentColor} />
      <AppearanceSection accent={me.accentColor} />
      <TypesSection types={data.types} />
      <RewardsSection rewards={data.rewards} />
      <FriendsSection data={data} />

      <Card id="app" title="App" hint="Instálala para abrirla como una app de tu móvil.">
        <InstallCard />
        <button
          disabled={pending}
          onClick={() => run(() => setOnboarded(false), () => router.push("/"))}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line text-sm font-medium"
        >
          <PlayCircle size={16} /> Ver la guía de inicio
        </button>
      </Card>

      <Card id="cuenta" title="Cuenta">
        <form action={signOutAction}>
          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line text-sm font-medium">
            <LogOut size={16} /> Cerrar sesión
          </button>
        </form>
      </Card>

      <AutoRefresh />
      <ThemeSync accent={me.accentColor} />
    </div>
  );
}
