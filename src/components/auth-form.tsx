"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type ActionResult } from "@/app/actions";

const input =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base outline-none focus:border-accent";

export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next: string }) {
  const signUp = mode === "sign-up";
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signUp ? signUpAction : signInAction, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="next" value={next} />
      {signUp && <input name="name" placeholder="Tu nombre" autoComplete="name" required className={input} />}
      <input name="email" type="email" placeholder="Email" autoComplete="email" required className={input} />
      <input
        name="password"
        type="password"
        placeholder="Contraseña (mín. 8)"
        autoComplete={signUp ? "new-password" : "current-password"}
        minLength={8}
        required
        className={input}
      />
      {state && !state.ok && (
        <p role="alert" className="text-sm text-accent-text">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="h-12 w-full rounded-2xl bg-accent font-semibold text-accent-fg transition active:scale-[.98] disabled:opacity-50"
      >
        {pending ? "…" : signUp ? "Crear cuenta" : "Entrar"}
      </button>
      <p className="pt-2 text-center text-sm text-muted">
        {signUp ? "¿Ya tienes cuenta? " : "¿Primera vez? "}
        <Link href={`/auth/${signUp ? "sign-in" : "sign-up"}?next=${encodeURIComponent(next)}`} className="font-medium text-fg underline underline-offset-4">
          {signUp ? "Entra" : "Crea una cuenta"}
        </Link>
      </p>
    </form>
  );
}
