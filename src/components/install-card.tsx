"use client";

import { Check, Download, Share } from "lucide-react";
import { useSyncExternalStore } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

// Chrome/Edge/Android lanzan `beforeinstallprompt` una sola vez: lo guardamos para usarlo cuando el usuario pulse.
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

type State = "standalone" | "prompt" | "ios" | "other";

function snapshot(): State {
  const nav = navigator as Navigator & { standalone?: boolean };
  if (window.matchMedia("(display-mode: standalone)").matches || nav.standalone) return "standalone";
  if (deferred) return "prompt";
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "other";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function InstallCard() {
  const state = useSyncExternalStore(subscribe, snapshot, () => "other" as State);

  if (state === "standalone")
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-surface-2 p-3 text-sm">
        <Check size={16} className="text-positive" /> Recap ya está instalada en este dispositivo.
      </p>
    );

  if (state === "prompt")
    return (
      <button
        onClick={async () => {
          await deferred?.prompt();
          deferred = null;
          notify();
        }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-semibold text-accent-fg"
      >
        <Download size={18} /> Instalar Recap
      </button>
    );

  if (state === "ios")
    return (
      <ol className="space-y-2 rounded-2xl bg-surface-2 p-3 text-sm">
        <li>
          1. Abre esta web en <b>Safari</b>.
        </li>
        <li className="flex items-center gap-1">
          2. Toca <Share size={15} className="inline" /> <b>Compartir</b>.
        </li>
        <li>
          3. Elige <b>Añadir a pantalla de inicio</b>.
        </li>
      </ol>
    );

  return (
    <p className="rounded-2xl bg-surface-2 p-3 text-sm text-muted">
      En el menú de tu navegador elige <b className="text-fg">Instalar app</b> o <b className="text-fg">Añadir a pantalla de inicio</b>.
    </p>
  );
}
