"use client";

import { Check, Copy, UserMinus, X } from "lucide-react";
import { useState } from "react";
import { removeFriend, respondFriendRequest, sendFriendRequest } from "@/app/actions";
import { Avatar } from "@/components/ui/avatar";
import { Field, inputCls } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { DashboardData } from "@/lib/types";

export function FriendsSheet({ open, onClose, data }: { open: boolean; onClose: () => void; data: DashboardData }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const { run, pending, error } = useRun();

  async function copyLink() {
    const url = `${window.location.origin}/invite/${data.me.friendCode}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copia tu enlace de amistad", url);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Amigos">
      <div className="space-y-6">
        {data.pending.length > 0 && (
          <Field label="Solicitudes">
            <ul className="space-y-2">
              {data.pending.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                  <Avatar name={r.from.name} id={r.from.id} size={32} />
                  <span className="flex-1 text-sm font-medium">{r.from.name}</span>
                  <button aria-label="Aceptar" disabled={pending} onClick={() => run(() => respondFriendRequest(r.id, true))} className="grid size-9 place-items-center rounded-full bg-accent text-accent-fg">
                    <Check size={16} />
                  </button>
                  <button aria-label="Rechazar" disabled={pending} onClick={() => run(() => respondFriendRequest(r.id, false))} className="grid size-9 place-items-center rounded-full bg-bg text-muted">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </Field>
        )}

        <Field label="Añadir por email">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => sendFriendRequest(email), () => {
                setEmail("");
                setSent(true);
              });
            }}
          >
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
              }}
              type="email"
              placeholder="amigo@email.com"
              className={inputCls}
            />
            <button disabled={pending || !email} className="h-12 shrink-0 rounded-2xl bg-accent px-5 font-semibold text-accent-fg disabled:opacity-40">
              Añadir
            </button>
          </form>
          {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
          {sent && <p className="text-sm text-positive">Solicitud enviada.</p>}
        </Field>

        <button onClick={copyLink} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-line text-sm font-medium">
          {copied ? <Check size={16} className="text-positive" /> : <Copy size={16} />}
          {copied ? "Enlace copiado" : "Copiar mi enlace de amistad"}
        </button>

        <Field label={`Tus amigos (${data.friends.length})`}>
          <ul className="space-y-2">
            {data.friends.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                <Avatar name={f.name} id={f.id} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="truncate text-xs text-muted">{f.email}</p>
                </div>
                <button
                  aria-label={`Quitar a ${f.name}`}
                  disabled={pending}
                  onClick={() => confirm(`¿Quitar a ${f.name} de tus amigos?`) && run(() => removeFriend(f.id))}
                  className="grid size-9 place-items-center rounded-full text-muted"
                >
                  <UserMinus size={16} />
                </button>
              </li>
            ))}
            {data.friends.length === 0 && <li className="text-sm text-muted">Aún no tienes amigos añadidos.</li>}
          </ul>
        </Field>
      </div>
    </Sheet>
  );
}
