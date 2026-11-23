"use client";

import { Car, Check, Copy, NotebookPen } from "lucide-react";
import { useState } from "react";
import { sendFriendRequest, setOnboarded, updateAccent, updateProfile } from "@/app/actions";
import { InstallCard } from "@/components/install-card";
import { setThemeMode, useThemeMode, type ThemeMode } from "@/components/theme-toggle";
import { Chip, Field, inputCls } from "@/components/ui/form";
import { useRun } from "@/components/use-run";
import { ACCENT_PRESETS, applyAccent } from "@/lib/accent";
import type { RecapData } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = ["Bienvenida", "Perfil", "Apariencia", "Amigos", "Instalar"] as const;
const num = (s: string) => Number(s.replace(",", "."));
const MODES: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "Sistema" },
  { id: "light", label: "Claro" },
  { id: "dark", label: "Oscuro" },
];

/** Guía de primera vez, a pantalla completa. Se puede saltar en cualquier paso. */
export function Onboarding({ data, onDone }: { data: RecapData; onDone: () => void }) {
  const { me, vehicle } = data;
  const [step, setStep] = useState(0);
  const { run, pending, error, setError } = useRun();

  // Perfil
  const [name, setName] = useState(me.name);
  const [hasCar, setHasCar] = useState(vehicle.hasCar);
  const [price, setPrice] = useState(String(vehicle.fuelPricePerL));
  const [cons, setCons] = useState(String(vehicle.consumptionL100));
  // Apariencia
  const [accent, setAccent] = useState(me.accentColor);
  const mode = useThemeMode();
  // Amigos
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const last = step === STEPS.length - 1;
  const finish = () => run(() => setOnboarded(true), onDone);
  const go = (n: number) => {
    setError(null);
    setStep(n);
  };

  function next() {
    if (step === 1) {
      run(
        () =>
          updateProfile({
            name: name.trim() || me.name,
            hasCar,
            fuelPricePerL: num(price) || vehicle.fuelPricePerL,
            consumptionL100: num(cons) || vehicle.consumptionL100,
            euroPerCredit: vehicle.euroPerCredit,
            tripXp: vehicle.tripXp,
            accentColor: me.accentColor,
          }),
        () => go(2),
      );
    } else if (last) finish();
    else go(step + 1);
  }

  async function copyLink() {
    const url = `${window.location.origin}/invite/${me.friendCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia tu enlace de amistad", url);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-bg" role="dialog" aria-modal="true" aria-label="Guía de inicio">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5" aria-label={`Paso ${step + 1} de ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <span key={s} className={cn("h-1.5 w-8 rounded-full transition", i <= step ? "bg-accent" : "bg-surface-2")} />
            ))}
          </div>
          <button onClick={finish} disabled={pending} className="text-sm font-medium text-muted">
            Saltar
          </button>
        </div>

        <div className="flex-1 space-y-6 py-8">
          {step === 0 && (
            <>
              <div>
                <span className="mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-2xl font-extrabold text-accent-fg">R</span>
                <h1 className="text-3xl font-semibold tracking-tight">Bienvenido a Recap</h1>
                <p className="mt-2 text-muted">El diario compartido con tus amigos. Dos cosas, bien separadas:</p>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-4 rounded-3xl border border-line bg-surface p-4">
                  <NotebookPen className="mt-0.5 shrink-0 text-accent-text" />
                  <div>
                    <p className="font-semibold">Recap</p>
                    <p className="text-sm text-muted">Registra planes, viajes y contadores. Ganas <b className="text-fg">XP</b> y medallas y os comparáis.</p>
                  </div>
                </li>
                <li className="flex gap-4 rounded-3xl border border-line bg-surface p-4">
                  <Car className="mt-0.5 shrink-0 text-accent-text" />
                  <div>
                    <p className="font-semibold">Coche</p>
                    <p className="text-sm text-muted">Los trayectos generan <b className="text-fg">créditos</b> que se saldan invitando a algo (una tortilla, una cena). Sin dinero de por medio.</p>
                  </div>
                </li>
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Tu perfil</h1>
                <p className="mt-1 text-sm text-muted">Con esto calculamos los créditos de tus trayectos. Lo cambias cuando quieras en Ajustes.</p>
              </div>
              <Field label="¿Cómo te llamas?">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
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
              {hasCar && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Gasolina €/l">
                    <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={inputCls} />
                  </Field>
                  <Field label="Consumo l/100 km">
                    <input value={cons} onChange={(e) => setCons(e.target.value)} inputMode="decimal" className={inputCls} />
                  </Field>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Hazla tuya</h1>
                <p className="mt-1 text-sm text-muted">Elige un color y el modo. Toda la app se tiñe de ese tono.</p>
              </div>
              <Field label="Color">
                <div className="flex flex-wrap items-center gap-3">
                  {ACCENT_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      aria-pressed={accent === c}
                      onClick={() => {
                        setAccent(c);
                        applyAccent(c);
                        run(() => updateAccent(c));
                      }}
                      className={cn("size-10 rounded-full border-2 transition active:scale-90", accent === c ? "border-fg" : "border-transparent")}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Modo">
                <div className="flex flex-wrap gap-2">
                  {MODES.map((m) => (
                    <Chip key={m.id} active={mode === m.id} onClick={() => setThemeMode(m.id)}>
                      {m.label}
                    </Chip>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Añade a tus amigos</h1>
                <p className="mt-1 text-sm text-muted">Los registros en grupo, los trayectos y los rankings necesitan al menos un amigo.</p>
              </div>
              <Field label="Por email (ya registrado en Recap)">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => sendFriendRequest(email), () => {
                      setSent(email);
                      setEmail("");
                    });
                  }}
                >
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="amigo@email.com" className={inputCls} />
                  <button disabled={pending || !email} className="h-12 shrink-0 rounded-2xl bg-accent px-5 font-semibold text-accent-fg disabled:opacity-40">
                    Añadir
                  </button>
                </form>
                {sent && <p className="text-sm text-positive">Solicitud enviada a {sent}.</p>}
              </Field>
              <button onClick={copyLink} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line text-sm font-medium">
                {copied ? <Check size={16} className="text-positive" /> : <Copy size={16} />}
                {copied ? "Enlace copiado" : "O comparte tu enlace de amistad"}
              </button>
              <p className="text-xs text-muted">Puedes hacerlo más tarde desde Ajustes → Amigos.</p>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Instálala en tu móvil</h1>
                <p className="mt-1 text-sm text-muted">Se abre como una app, a pantalla completa y desde el icono de inicio.</p>
              </div>
              <InstallCard />
              <ul className="space-y-2 rounded-3xl border border-line bg-surface p-4 text-sm">
                <li>
                  <b>Registrar</b> (botón de abajo): añade planes y viajes.
                </li>
                <li>
                  <b>+</b> en un contador: suma 1 con un toque.
                </li>
                <li>
                  <b>Coche</b>: trayectos, créditos y canjes.
                </li>
                <li>
                  <b>Engranaje</b>: categorías, colores y amigos.
                </li>
              </ul>
            </>
          )}

          {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => go(step - 1)} disabled={pending} className="h-12 rounded-2xl border border-line px-5 font-medium">
              Atrás
            </button>
          )}
          <button onClick={next} disabled={pending} className="h-12 flex-1 rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.98] disabled:opacity-50">
            {pending ? "Guardando…" : last ? "Empezar" : step === 0 ? "Vamos" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}
