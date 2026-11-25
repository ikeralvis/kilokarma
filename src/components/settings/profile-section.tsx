"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions";
import { Chip, Field, inputCls, SubmitButton } from "@/components/ui/form";
import { useRun } from "@/components/use-run";
import { costPerKm } from "@/lib/credits";
import type { Person, VehicleView } from "@/lib/types";
import { Credits } from "@/components/ui/coin";
import { Card } from "./card";

const num = (s: string) => Number(s.replace(",", "."));

export function ProfileSection({ me, vehicle, accent }: { me: Person; vehicle: VehicleView; accent: string }) {
  const [name, setName] = useState(me.name);
  const [hasCar, setHasCar] = useState(vehicle.hasCar);
  const [price, setPrice] = useState(String(vehicle.fuelPricePerL));
  const [cons, setCons] = useState(String(vehicle.consumptionL100));
  const [epc, setEpc] = useState(String(vehicle.euroPerCredit));
  const [xp, setXp] = useState(String(vehicle.tripXp));
  const [saved, setSaved] = useState(false);
  const { run, pending, error } = useRun();

  const perKm = costPerKm(num(price) || 0, num(cons) || 0);
  const epcNum = num(epc) || vehicle.euroPerCredit;

  return (
    <>
      <Card id="perfil" title="Perfil">
        <Field label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </Field>
        <Field label="¿Tienes coche?">
          <div className="flex gap-2">
            <Chip active={hasCar} onClick={() => setHasCar(true)}>
              Sí, conduzco
            </Chip>
            <Chip active={!hasCar} onClick={() => setHasCar(false)}>
              No tengo
            </Chip>
          </div>
        </Field>
      </Card>

      <Card id="coche" title="Coche y créditos" hint="Con esto se calculan los créditos que te deben tus acompañantes.">
        {hasCar ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Gasolina €/l">
                <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} />
              </Field>
              <Field label="Consumo l/100 km">
                <input value={cons} onChange={(e) => setCons(e.target.value)} inputMode="decimal" className={inputCls} />
              </Field>
              <Field label="1 crédito = (€)">
                <input value={epc} onChange={(e) => setEpc(e.target.value)} inputMode="decimal" className={inputCls} />
              </Field>
              <Field label="XP por viaje">
                <input value={xp} onChange={(e) => setXp(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={inputCls} />
              </Field>
            </div>
            <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted">
              Cada km cuesta <span className="font-medium text-fg">{perKm.toFixed(3)} €</span> ≈{" "}
              <Credits value={(perKm / epcNum).toFixed(2)} className="font-medium text-fg" />. Un viaje de 12 km ≈{" "}
              <Credits value={Math.round((12 * perKm) / epcNum)} className="font-medium text-fg" />. El precio de la gasolina se actualiza solo con el último que metas en un viaje.
            </p>
          </>
        ) : (
          <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted">Sin coche, siempre irás de acompañante y no saldrás como conductor.</p>
        )}
        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(false);
            run(
              () =>
                updateProfile({
                  name,
                  hasCar,
                  fuelPricePerL: num(price) || vehicle.fuelPricePerL,
                  consumptionL100: num(cons) || vehicle.consumptionL100,
                  euroPerCredit: num(epc) || vehicle.euroPerCredit,
                  tripXp: Number(xp) || 0,
                  accentColor: accent,
                }),
              () => setSaved(true),
            );
          }}
        >
          <SubmitButton pending={pending}>{saved ? "Guardado ✓" : "Guardar perfil y coche"}</SubmitButton>
        </form>
      </Card>
    </>
  );
}
