"use client";

import { useState } from "react";
import { updateAccent } from "@/app/actions";
import { setThemeMode, useThemeMode, type ThemeMode } from "@/components/theme-toggle";
import { Chip, Field } from "@/components/ui/form";
import { useRun } from "@/components/use-run";
import { ACCENT_PRESETS, applyAccent, isHex } from "@/lib/accent";
import { cn } from "@/lib/utils";
import { Card } from "./card";

const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "Sistema" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
];

export function AppearanceSection({ accent: initial }: { accent: string }) {
  const mode = useThemeMode();
  const [accent, setAccent] = useState(initial);
  const [hex, setHex] = useState(initial);
  const { run, error } = useRun();

  function pick(color: string) {
    if (!isHex(color)) return;
    const c = color.toLowerCase();
    setAccent(c);
    setHex(c);
    applyAccent(c); // vista previa inmediata y guardada en este dispositivo
    run(() => updateAccent(c)); // y en tu perfil para otros dispositivos
  }

  return (
    <Card id="apariencia" title="Apariencia" hint="Elige un color y toda la app se tiñe de ese tono.">
      <Field label="Modo">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Chip key={m.id} active={mode === m.id} onClick={() => setThemeMode(m.id)}>
              {m.label}
            </Chip>
          ))}
        </div>
      </Field>

      <Field label="Color">
        <div className="flex flex-wrap items-center gap-3">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={accent === c}
              onClick={() => pick(c)}
              className={cn("size-9 rounded-full border-2 transition active:scale-90", accent === c ? "border-fg" : "border-transparent")}
              style={{ background: c }}
            />
          ))}
          <label className="relative grid size-9 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-line text-xs text-muted">
            +
            <input
              type="color"
              value={accent}
              onChange={(e) => pick(e.target.value)}
              aria-label="Elegir otro color"
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
        </div>
        <input
          value={hex}
          onChange={(e) => {
            setHex(e.target.value);
            if (isHex(e.target.value)) pick(e.target.value);
          }}
          maxLength={7}
          aria-label="Código de color"
          className="mt-2 h-11 w-32 rounded-2xl border border-line bg-bg px-4 font-mono text-base outline-none focus:border-accent"
        />
      </Field>
      {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
    </Card>
  );
}
