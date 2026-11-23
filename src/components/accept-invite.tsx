"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptInvite } from "@/app/actions";

export function AcceptInvite({ code }: { code: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await acceptInvite(code);
            if (r.ok) router.replace("/");
            else setError(r.error);
          })
        }
        className="h-12 w-full rounded-2xl bg-accent font-semibold text-accent-fg disabled:opacity-50"
      >
        Aceptar
      </button>
      {error && <p className="text-sm text-accent-text">{error}</p>}
    </div>
  );
}
