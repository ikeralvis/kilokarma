"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;

/** Reloj por minutos; `null` en servidor/hidratación (evita Date.now() en prerender). */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, minuteNow, () => null);
}
