import { Gift } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Coin, Credits } from "@/components/ui/coin";
import { rewardProgress, type PairBalance } from "@/lib/balance";
import { DEFAULT_REWARD_GOAL } from "@/lib/credits";
import type { Person, RewardView } from "@/lib/types";
import { fmtCredits } from "@/lib/utils";

export function BalanceCard({
  meId,
  pairs,
  people,
  hasFriends,
  rewards,
}: {
  meId: string;
  pairs: PairBalance[];
  people: Person[];
  hasFriends: boolean;
  /** Listas de canjes (mía y de amigos): la barra avanza hacia el canje más barato de quien cobra. */
  rewards: RewardView[];
}) {
  const byId = new Map(people.map((m) => [m.id, m]));
  const total = pairs.reduce((a, p) => a + p.net, 0);
  const sorted = [...pairs].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
  const goalOf = (creditorId: string) => {
    const cheapest = rewards.filter((r) => r.ownerId === creditorId).sort((a, b) => a.credits - b.credits)[0];
    return cheapest ? { name: cheapest.name, credits: cheapest.credits } : { name: "un canje", credits: DEFAULT_REWARD_GOAL };
  };

  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Balance neto</p>
      <p className="mt-1 flex items-center gap-2 text-4xl font-semibold tracking-tight tabular-nums">
        {total > 0 ? "+" : total < 0 ? "−" : ""}
        {fmtCredits(Math.abs(total))}
        <Coin size={34} />
      </p>
      <p className="text-sm text-muted">{total > 0 ? "Te deben en total" : total < 0 ? "Debes en total" : "Estáis en paz"}</p>

      {!hasFriends && (
        <p className="mt-5 rounded-2xl bg-surface-2 p-3 text-sm text-muted">
          Añade a un amigo en{" "}
          <Link href="/ajustes#amigos" className="font-medium text-fg underline underline-offset-4">
            Ajustes
          </Link>{" "}
          para empezar a registrar viajes.
        </p>
      )}

      <ul className="mt-5 space-y-4">
        {sorted.map((p) => {
          const m = byId.get(p.userId);
          if (!m) return null;
          const theyOwe = p.net > 0;
          // Quien cobra pone los precios: si me deben, mi lista; si debo, la suya.
          const goal = goalOf(theyOwe ? meId : p.userId);
          const { progress, remaining, rewards: ready } = rewardProgress(p.net, goal.credits);
          return (
            <li key={p.userId}>
              <div className="flex items-center gap-3">
                <Avatar name={m.name} id={m.id} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-1 text-sm font-medium">
                    {p.net === 0 ? (
                      `En paz con ${m.name}`
                    ) : theyOwe ? (
                      <>
                        {m.name} te debe <Credits value={fmtCredits(p.net)} />
                      </>
                    ) : (
                      <>
                        Le debes <Credits value={fmtCredits(-p.net)} /> a {m.name}
                      </>
                    )}
                  </p>
                  {p.net !== 0 && (
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Gift size={12} />
                      {ready > 0 ? `Da para ${ready}× «${goal.name}» · ` : ""}
                      faltan {remaining} para «{goal.name}»
                    </p>
                  )}
                </div>
              </div>
              {p.net !== 0 && (
                <div className="mt-2 ml-12 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                  <div className={`h-full rounded-full transition-[width] duration-500 ${theyOwe ? "bg-positive" : "bg-accent"}`} style={{ width: `${Math.max(4, progress * 100)}%` }} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
