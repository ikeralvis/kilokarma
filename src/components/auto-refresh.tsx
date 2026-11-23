"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Mantiene los datos al día (amigos nuevos, viajes del otro) al volver a la app y cada 30 s. */
export function AutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", refresh);
    const t = setInterval(refresh, 30_000);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      clearInterval(t);
    };
  }, [router]);
  return null;
}
