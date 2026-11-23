"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";
import { applyAccent, isHex } from "@/lib/accent";

export type ThemeMode = "system" | "light" | "dark";

const listeners = new Set<() => void>();
const query = () => window.matchMedia("(prefers-color-scheme: dark)");
const notify = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = query();
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

/** Modo elegido (sistema si no hay nada guardado). */
function readMode(): ThemeMode {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "system";
}

export function setThemeMode(mode: ThemeMode) {
  const root = document.documentElement;
  try {
    if (mode === "system") {
      delete root.dataset.theme;
      localStorage.removeItem("theme");
    } else {
      root.dataset.theme = mode;
      localStorage.setItem("theme", mode);
    }
  } catch {
    /* modo privado: el cambio dura solo esta sesión */
  }
  notify();
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribe, readMode, () => "system" as const);
}

function useEffective(): "light" | "dark" {
  return useSyncExternalStore(
    subscribe,
    () => {
      const m = readMode();
      return m === "system" ? (query().matches ? "dark" : "light") : m;
    },
    () => "light" as const,
  );
}

/** Botón rápido claro/oscuro para las cabeceras. */
export function ThemeToggle() {
  const theme = useEffective();
  return (
    <button
      type="button"
      onClick={() => setThemeMode(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="grid size-11 place-items-center rounded-full border border-line bg-surface"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

/** Sincroniza el color de acento guardado en el perfil con este dispositivo. */
export function ThemeSync({ accent }: { accent: string }) {
  useEffect(() => {
    if (isHex(accent)) applyAccent(accent);
  }, [accent]);
  return null;
}
