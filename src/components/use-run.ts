"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/app/actions";

/** Ejecuta una Server Action mostrando estado de carga y error. */
export function useRun() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<ActionResult>, onOk?: () => void) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.ok) onOk?.();
      else setError(r.error);
    });
  }
  return { run, pending, error, setError };
}
