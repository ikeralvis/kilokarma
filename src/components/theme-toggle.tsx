"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const query = () => window.matchMedia("(prefers-color-scheme: dark)");

function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = query();
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

function current(): "light" | "dark" {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return query().matches ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => "light" as const);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* modo privado: el cambio dura solo esta sesión */
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="grid size-11 place-items-center rounded-full border border-line bg-surface"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
