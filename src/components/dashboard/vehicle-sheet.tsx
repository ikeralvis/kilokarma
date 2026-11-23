"use client";

import { useState } from "react";
import { updateVehicle } from "@/app/actions";
import { Field, inputCls, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import { costPerKm, EUR_PER_CREDIT } from "@/lib/credits";
import type { VehicleView } from "@/lib/types";

const num = (s: string) => Number(s.replace(",", "."));

export function VehicleSheet({ open, onClose, vehicle }: { open: boolean; onClose: () => void; vehicle: VehicleView }) {
  const [price, setPrice] = useState(String(vehicle.fuelPricePerL));
  const [cons, setCons] = useState(String(vehicle.consumptionL100));
  const { run, pending, error } = useRun();
  const perKm = costPerKm(num(price) || 0, num(cons) || 0);

  return (
    <Sheet open={open} onClose={onClose} title="Mi coche">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => updateVehicle({ fuelPricePerL: num(price), consumptionL100: num(cons) }), onClose);
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Gasolina €/l">
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} />
          </Field>
          <Field label="Consumo l/100 km">
            <input value={cons} onChange={(e) => setCons(e.target.value)} inputMode="decimal" className={inputCls} />
          </Field>
        </div>
        <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted">
          Cada km te cuesta <span className="font-medium text-fg">{perKm.toFixed(3)} €</span> ≈{" "}
          <span className="font-medium text-fg">{(perKm / EUR_PER_CREDIT).toFixed(2)} créditos</span> (1 crédito = {EUR_PER_CREDIT.toFixed(2)} €). El precio se actualiza solo con el último que metas en un viaje.
        </p>
        {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        <SubmitButton pending={pending}>Guardar</SubmitButton>
      </form>
    </Sheet>
  );
}
