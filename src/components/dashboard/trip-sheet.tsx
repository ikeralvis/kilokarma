"use client";

import { useState } from "react";
import { addTrip, updateTrip } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Credits } from "@/components/ui/coin";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import { splitCredits } from "@/lib/balance";
import { costPerKm, creditsForTrip } from "@/lib/credits";
import { groupRoutes } from "@/lib/routes";
import type { FavoriteView, FriendView, Person, TripView, VehicleView } from "@/lib/types";

const num = (s: string) => Number(s.replace(",", "."));

export function TripSheet({
  open,
  onClose,
  me,
  vehicle,
  friends,
  preset,
  trips,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  me: Person;
  vehicle: VehicleView;
  friends: FriendView[];
  /** Favorito: rellena todo para registrar con un toque. */
  preset?: FavoriteView | null;
  /** Viajes ya hechos: de aquí salen las sugerencias. */
  trips: TripView[];
  /** Si viene, el formulario edita ese viaje en vez de crear uno. */
  editing?: TripView | null;
}) {
  // El padre monta este componente con `key` distinto por apertura → el estado se reinicia solo.
  const presetFriend = preset?.friendId && friends.some((f) => f.id === preset.friendId) ? preset.friendId : null;
  const soleFriend = friends.length === 1 ? friends[0].id : null;
  const defaultFriend = presetFriend ?? soleFriend;

  const [origin, setOrigin] = useState(editing?.origin ?? preset?.origin ?? "");
  const [destination, setDestination] = useState(editing?.destination ?? preset?.destination ?? "");
  const [km, setKm] = useState(editing ? String(editing.distanceKm) : preset ? String(preset.distanceKm) : "");
  // Solo pueden conducir quienes tienen coche.
  const carFriends = friends.filter((f) => f.hasCar);
  const drivers = [...(vehicle.hasCar ? [{ id: me.id, name: "Yo" }] : []), ...carFriends.map((f) => ({ id: f.id, name: f.name }))];
  const presetDriver = preset?.driver === "friend" && presetFriend && carFriends.some((f) => f.id === presetFriend) ? presetFriend : null;
  const [driverId, setDriverId] = useState(editing?.driverId ?? presetDriver ?? (vehicle.hasCar ? me.id : (carFriends.length === 1 ? carFriends[0].id : (drivers[0]?.id ?? ""))));
  const [riders, setRiders] = useState<string[]>(editing ? editing.passengers.map((p) => p.passengerId) : defaultFriend && driverId === me.id ? [defaultFriend] : []);
  const [priceEdit, setPriceEdit] = useState<string | null>(editing ? String(editing.fuelPricePerL) : null);
  const [favName, setFavName] = useState("");
  const [saveFav, setSaveFav] = useState(false);
  const { run, pending, error } = useRun();

  const driverVehicle = driverId === me.id ? vehicle : (friends.find((f) => f.id === driverId) ?? vehicle);
  const price = priceEdit ?? String(driverVehicle.fuelPricePerL);

  // Si conduce un amigo, tú vas siempre de acompañante.
  const passengerIds = driverId === me.id ? riders.filter((r) => r !== me.id) : [...new Set([me.id, ...riders])].filter((r) => r !== driverId);
  const distance = num(km);
  const priceNum = num(price);
  const credits = creditsForTrip(distance || 0, priceNum || 0, driverVehicle.consumptionL100, driverVehicle.euroPerCredit);
  const split = splitCredits(credits, passengerIds.length);
  const nameOf = (id: string) => (id === me.id ? "Tú" : (friends.find((f) => f.id === id)?.name ?? "?"));
  const valid = driverId !== "" && destination.trim() !== "" && distance > 0 && priceNum > 0 && passengerIds.length > 0;

  const everyone = [{ id: me.id, name: "Yo" }, ...friends.map((f) => ({ id: f.id, name: f.name }))];

  // Sugerencias: rutas ya hechas (las más repetidas primero), filtradas por lo que escribes.
  const q = destination.trim().toLowerCase();
  const suggestions = editing || preset ? [] : groupRoutes(trips).filter((g) => !q || g.destination.toLowerCase().includes(q) || g.origin.toLowerCase().includes(q)).slice(0, 5);
  const applyRoute = (g: ReturnType<typeof groupRoutes>[number]) => {
    setOrigin(g.origin);
    setDestination(g.destination);
    setKm(String(g.distanceKm));
    const drv = drivers.find((d) => d.id === g.driverId)?.id;
    if (drv) {
      setDriverId(drv);
      setRiders(g.passengerIds.filter((id) => id !== drv && everyone.some((e) => e.id === id)));
    }
    setPriceEdit(null);
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? "Editar trayecto" : preset ? preset.name : "Nuevo trayecto"}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          const base = { origin, destination, distanceKm: distance, driverId, passengerIds, fuelPricePerL: priceNum };
          run(() => (editing ? updateTrip(editing.id, base) : addTrip({ ...base, saveFavorite: saveFav ? favName.trim() || destination.trim() : undefined })), onClose);
        }}
      >
        {suggestions.length > 0 && (
          <Field label="Rutas que ya has hecho">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((g) => (
                <button key={g.key} type="button" onClick={() => applyRoute(g)} className="h-9 rounded-full bg-surface-2 px-3 text-xs font-medium active:scale-95">
                  {g.origin ? `${g.origin} → ` : ""}
                  {g.destination} · {g.distanceKm} km · {g.count}×
                </button>
              ))}
            </div>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Origen">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Casa" className={inputCls} />
          </Field>
          <Field label="Destino">
            <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Gym" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Kilómetros">
            <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="0" className={inputCls} />
          </Field>
          <Field label="Gasolina €/l">
            <input value={price} onChange={(e) => setPriceEdit(e.target.value)} inputMode="decimal" className={inputCls} />
          </Field>
        </div>

        <Field label="¿Quién conducía?">
          <div className="flex flex-wrap gap-2">
            {drivers.map((m) => (
              <Chip key={m.id} active={driverId === m.id} onClick={() => setDriverId(m.id)}>
                {m.name}
              </Chip>
            ))}
            {drivers.length === 0 && <p className="text-sm text-muted">Nadie tiene coche: marca «Tengo coche» en el perfil de quien conduzca.</p>}
          </div>
        </Field>

        <Field label="¿Quién iba de acompañante?">
          <div className="flex flex-wrap gap-2">
            {everyone
              .filter((m) => m.id !== driverId)
              .map((m) => {
                const forced = driverId !== me.id && m.id === me.id;
                const active = forced || riders.includes(m.id);
                return (
                  <Chip
                    key={m.id}
                    active={active}
                    disabled={forced}
                    onClick={() => setRiders((r) => (r.includes(m.id) ? r.filter((x) => x !== m.id) : [...r, m.id]))}
                  >
                    {m.name}
                  </Chip>
                );
              })}
            {friends.length === 0 && <p className="text-sm text-muted">Primero añade un amigo en Ajustes.</p>}
          </div>
        </Field>

        <div className="rounded-2xl bg-surface-2 p-3 text-sm">
          <p className="flex flex-wrap items-center gap-x-1.5 font-medium">
            {driverId ? (driverId === me.id ? "Ganas" : `${nameOf(driverId)} gana`) : "Total"} <Credits value={credits} className="font-semibold" />
            <span className="font-normal text-muted">· {(distance * costPerKm(priceNum || 0, driverVehicle.consumptionL100) || 0).toFixed(2)} € de gasolina</span>
          </p>
          {passengerIds.length > 0 && credits > 0 && (
            <p className="mt-1 text-xs text-muted">
              {passengerIds.map((id, i) => `${id === me.id ? "Tú le debes" : `${nameOf(id)} le debe`} ${split[i]}`).join(" · ")}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted">Quien conduce gana los créditos; quien va de acompañante los debe.</p>
        </div>

        {!preset && !editing && (
          <div className="space-y-2">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={saveFav} onChange={(e) => setSaveFav(e.target.checked)} className="size-5 accent-[var(--accent)]" />
              Guardar como viaje favorito
            </label>
            {saveFav && <input value={favName} onChange={(e) => setFavName(e.target.value)} placeholder="Nombre (p. ej. Ir al gym)" className={inputCls} />}
          </div>
        )}

        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        <SubmitButton disabled={!valid} pending={pending}>
          {editing ? "Guardar cambios" : "Registrar trayecto"}
        </SubmitButton>
      </form>
    </Sheet>
  );
}
