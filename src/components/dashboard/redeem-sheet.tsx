"use client";

import Link from "next/link";
import { useState } from "react";
import { redeem, requestRedemption } from "@/app/actions";
import { Coin, Credits } from "@/components/ui/coin";
import { Chip, Field, inputCls, Segmented, SubmitButton } from "@/components/ui/form";
import { Sheet } from "@/components/ui/sheet";
import { useRun } from "@/components/use-run";
import type { PairBalance } from "@/lib/balance";
import type { Person, RewardView } from "@/lib/types";
import { cn, fmtCredits } from "@/lib/utils";

type Mode = "pay" | "ask";

/**
 * Canjear créditos. Los precios los pone siempre quien cobra:
 *  - «Invitar»: pagas tu deuda con algo de la lista de tu amigo.
 *  - «Pedir»: le pides a quien te debe algo de TU lista.
 * En ambos casos lo confirma la otra persona.
 */
export function RedeemSheet({
  open,
  onClose,
  me,
  people,
  pairs,
  rewards,
}: {
  open: boolean;
  onClose: () => void;
  me: Person;
  people: Person[];
  pairs: PairBalance[];
  /** Listas de canjes mía y de mis amigos. */
  rewards: RewardView[];
}) {
  const iOwe = pairs.filter((p) => p.net < 0); // a quién debo
  const oweMe = pairs.filter((p) => p.net > 0); // quién me debe
  const [mode, setMode] = useState<Mode>(iOwe.length > 0 || oweMe.length === 0 ? "pay" : "ask");
  const candidates = mode === "pay" ? iOwe : oweMe;
  const [other, setOther] = useState(candidates[0]?.userId ?? "");
  const [rewardId, setRewardId] = useState("");
  const [custom, setCustom] = useState(false);
  const [concept, setConcept] = useState("");
  const [credits, setCredits] = useState("");
  const { run, pending, error } = useRun();

  const name = (id: string) => people.find((p) => p.id === id)?.name ?? "tu amigo";
  const debt = Math.abs(pairs.find((p) => p.userId === other)?.net ?? 0);
  // Precios de quien cobra: en «Invitar» los de mi amigo; en «Pedir» los míos.
  const ownerId = mode === "pay" ? other : me.id;
  const list = rewards.filter((r) => r.ownerId === ownerId);
  const picked = list.find((r) => r.id === rewardId);
  const valid = other !== "" && (custom ? concept.trim() !== "" && Number(credits) > 0 : !!picked);

  const switchMode = (m: Mode) => {
    setMode(m);
    setOther((m === "pay" ? iOwe : oweMe)[0]?.userId ?? "");
    setRewardId("");
    setCustom(false);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Canjear créditos">
      <div className="space-y-5">
        <Segmented
          label="¿Qué quieres hacer?"
          value={mode}
          onChange={switchMode}
          options={[
            { value: "pay", label: "Invitar", help: "Pagas lo que debes con algo de la lista de tu amigo. Él lo confirma." },
            { value: "ask", label: "Pedir", help: "Pides a quien te debe algo de tu lista. Él lo acepta." },
          ]}
        />

        {candidates.length === 0 ? (
          <div className="space-y-3 py-4 text-center">
            <p className="text-sm text-muted">{mode === "pay" ? "No debes créditos a nadie ahora mismo." : "Nadie te debe créditos ahora mismo."}</p>
            <Link href="/ajustes#canjes" className="text-sm font-medium underline underline-offset-4">
              Editar mi lista de canjes
            </Link>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!valid) return;
              if (mode === "ask") run(() => requestRedemption({ fromUserId: other, rewardId }), onClose);
              else run(() => redeem({ toUserId: other, concept: custom ? concept : picked!.name, credits: custom ? Number(credits) : picked!.credits }), onClose);
            }}
          >
            <Field label={mode === "pay" ? "¿A quién invitas?" : "¿A quién se lo pides?"}>
              <div className="flex flex-wrap gap-2">
                {candidates.map((p) => (
                  <Chip
                    key={p.userId}
                    active={other === p.userId}
                    onClick={() => {
                      setOther(p.userId);
                      setRewardId("");
                    }}
                  >
                    {name(p.userId)} · {fmtCredits(Math.abs(p.net))}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label={mode === "pay" ? `Lista de ${name(other)}` : "Tu lista"}>
              {list.length === 0 ? (
                <p className="text-sm text-muted">{mode === "pay" ? `${name(other)} aún no tiene lista de canjes.` : "Aún no tienes lista de canjes."}</p>
              ) : (
                <ul className="space-y-2">
                  {list.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setRewardId(r.id);
                          setCustom(false);
                        }}
                        aria-pressed={rewardId === r.id && !custom}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition",
                          rewardId === r.id && !custom ? "border-accent bg-accent/15" : "border-line bg-bg",
                        )}
                      >
                        <span className="font-medium">{r.name}</span>
                        <Credits value={r.credits} className={cn("font-semibold", r.credits > debt && "text-muted")} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {mode === "pay" && (
                <button type="button" onClick={() => setCustom((c) => !c)} className="text-xs font-medium text-muted underline underline-offset-4">
                  {custom ? "Elegir de la lista" : "Otra cosa (tu amigo confirma el precio)"}
                </button>
              )}
            </Field>

            {custom && (
              <div className="grid grid-cols-[1fr_6rem] gap-3">
                <input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="¿Qué?" className={inputCls} />
                <div className="relative">
                  <input value={credits} onChange={(e) => setCredits(e.target.value.replace(/\D/g, ""))} inputMode="numeric" className={`${inputCls} pr-9`} />
                  <Coin size={18} className="absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            <p className="rounded-2xl bg-surface-2 p-3 text-xs text-muted">
              {mode === "pay"
                ? `Debes ${fmtCredits(debt)} créditos a ${name(other)}. Los precios los pone quien cobra, y ${name(other)} tiene que confirmarlo para que se descuenten.`
                : `${name(other)} te debe ${fmtCredits(debt)} créditos. Cuando lo acepte, se descuentan.`}
            </p>

            {error && <p role="alert" className="text-sm text-accent-text">{error}</p>}
            <SubmitButton disabled={!valid} pending={pending}>
              {mode === "pay" ? "Registrar invitación" : `Pedírselo a ${name(other)}`}
            </SubmitButton>
          </form>
        )}
      </div>
    </Sheet>
  );
}
