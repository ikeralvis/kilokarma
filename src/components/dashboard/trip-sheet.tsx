"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/sheet";
import { creditsForDistance, splitCredits } from "@/lib/balance";
import type { Member, QuickRouteView } from "@/lib/mock";
import { cn } from "@/lib/utils";

export type NewTrip = {
  title: string;
  distanceKm: number;
  driverId: string;
  passengerIds: string[];
  saveAsQuickRoute: boolean;
};

export function TripSheet({
  open,
  onClose,
  members,
  meId,
  creditsPerKm,
  preset,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  members: Member[];
  meId: string;
  creditsPerKm: number;
  /** Ruta rápida: título y km vienen fijados. */
  preset?: QuickRouteView | null;
  onSubmit: (t: NewTrip) => void;
}) {
  // El padre monta este componente con `key` distinto por preset → el estado se reinicia solo.
  const [title, setTitle] = useState(preset?.name ?? "");
  const [km, setKm] = useState(preset ? String(preset.distanceKm) : "");
  const [driverId, setDriverId] = useState(meId);
  const [riders, setRiders] = useState<string[]>([]);
  const [save, setSave] = useState(false);

  const distance = Number(km.replace(",", "."));
  const total = creditsForDistance(distance || 0, creditsPerKm);
  const passengerIds = riders.filter((id) => id !== driverId);
  const split = splitCredits(total, passengerIds.length);
  const valid = title.trim().length > 0 && distance > 0 && passengerIds.length > 0;

  return (
    <Sheet open={open} onClose={onClose} title={preset ? preset.name : "Nuevo trayecto"}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          onSubmit({ title: title.trim(), distanceKm: distance, driverId, passengerIds, saveAsQuickRoute: save });
          onClose();
        }}
      >
        {!preset && (
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <Field label="Destino / ruta">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cena en Getxo" className={inputCls} />
            </Field>
            <Field label="Km">
              <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="0" className={inputCls} />
            </Field>
          </div>
        )}

        <Field label="¿Quién conducía?">
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <Chip key={m.id} active={driverId === m.id} onClick={() => setDriverId(m.id)}>
                {m.id === meId ? "Yo" : m.name}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="¿Quién iba de pasajero?">
          <div className="flex flex-wrap gap-2">
            {members
              .filter((m) => m.id !== driverId)
              .map((m) => (
                <Chip
                  key={m.id}
                  active={riders.includes(m.id)}
                  onClick={() => setRiders((r) => (r.includes(m.id) ? r.filter((x) => x !== m.id) : [...r, m.id]))}
                >
                  {m.id === meId ? "Yo" : m.name}
                </Chip>
              ))}
          </div>
        </Field>

        <div className="rounded-2xl bg-surface-2 p-3 text-sm">
          <p className="font-medium tabular-nums">
            {total} cr. <span className="font-normal text-muted">· {creditsPerKm} cr./km</span>
          </p>
          {passengerIds.length > 0 && total > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              {passengerIds
                .map((id, i) => `${members.find((m) => m.id === id)?.name} ${split[i]}`)
                .join(" · ")}
            </p>
          )}
        </div>

        {!preset && (
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="size-5 accent-[var(--accent)]" />
            Guardar como ruta rápida
          </label>
        )}

        <button
          type="submit"
          disabled={!valid}
          className="h-12 w-full rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.98] disabled:opacity-40"
        >
          Registrar trayecto
        </button>
      </form>
    </Sheet>
  );
}

const inputCls =
  "h-12 w-full rounded-2xl border border-line bg-bg px-4 text-base outline-none focus:border-accent"; // 16px+ evita zoom en iOS

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-10 rounded-full border px-4 text-sm font-medium transition active:scale-95",
        active ? "border-accent bg-accent text-accent-fg" : "border-line bg-bg text-fg",
      )}
    >
      {children}
    </button>
  );
}
