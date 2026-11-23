"use client";

import { useState } from "react";
import { addTrip } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import { splitCredits } from "@/lib/balance";
import { costPerKm, creditsForTrip } from "@/lib/credits";
import type { FavoriteView, FriendView, Person, VehicleView } from "@/lib/types";

const num = (s: string) => Number(s.replace(",", "."));

export function TripSheet({
  open,
  onClose,
  me,
  vehicle,
  friends,
  preset,
}: {
  open: boolean;
  onClose: () => void;
  me: Person;
  vehicle: VehicleView;
  friends: FriendView[];
  /** Favorito: rellena todo para registrar con un toque. */
  preset?: FavoriteView | null;
}) {
  // El padre monta este componente con `key` distinto por apertura → el estado se reinicia solo.
  const presetFriend = preset?.friendId && friends.some((f) => f.id === preset.friendId) ? preset.friendId : null;
  const soleFriend = friends.length === 1 ? friends[0].id : null;
  const defaultFriend = presetFriend ?? soleFriend;

  const [origin, setOrigin] = useState(preset?.origin ?? "");
  const [destination, setDestination] = useState(preset?.destination ?? "");
  const [km, setKm] = useState(preset ? String(preset.distanceKm) : "");
  // Solo pueden conducir quienes tienen coche.
  const carFriends = friends.filter((f) => f.hasCar);
  const drivers = [...(vehicle.hasCar ? [{ id: me.id, name: "Yo" }] : []), ...carFriends.map((f) => ({ id: f.id, name: f.name }))];
  const presetDriver = preset?.driver === "friend" && presetFriend && carFriends.some((f) => f.id === presetFriend) ? presetFriend : null;
  const [driverId, setDriverId] = useState(presetDriver ?? (vehicle.hasCar ? me.id : (carFriends.length === 1 ? carFriends[0].id : (drivers[0]?.id ?? ""))));
  const [riders, setRiders] = useState<string[]>(defaultFriend && driverId === me.id ? [defaultFriend] : []);
  const [priceEdit, setPriceEdit] = useState<string | null>(null);
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

  return (
    <Sheet open={open} onClose={onClose} title={preset ? preset.name : "Nuevo trayecto"}>
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          run(
            () =>
              addTrip({
                origin,
                destination,
                distanceKm: distance,
                driverId,
                passengerIds,
                fuelPricePerL: priceNum,
                saveFavorite: saveFav ? favName.trim() || destination.trim() : undefined,
              }),
            onClose,
          );
        }}
      >
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
            {friends.length === 0 && <p className="text-sm text-muted">Primero añade un amigo (botón de amigos, arriba).</p>}
          </div>
        </Field>

        <div className="rounded-2xl bg-surface-2 p-3 text-sm">
          <p className="font-medium tabular-nums">
            {credits} cr. <span className="font-normal text-muted">· {(distance * costPerKm(priceNum || 0, driverVehicle.consumptionL100) || 0).toFixed(2)} €</span>
          </p>
          {passengerIds.length > 0 && credits > 0 && (
            <p className="mt-0.5 text-xs text-muted">{passengerIds.map((id, i) => `${nameOf(id)} ${split[i]}`).join(" · ")}</p>
          )}
        </div>

        {!preset && (
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
          Registrar trayecto
        </SubmitButton>
      </form>
    </Sheet>
  );
}
