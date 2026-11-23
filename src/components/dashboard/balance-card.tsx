import { Gift } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import type { PairBalance } from "@/lib/balance";
import { rewardProgress } from "@/lib/balance";
import type { Member } from "@/lib/mock";
import { fmtCredits } from "@/lib/utils";

export function BalanceCard({
  pairs,
  members,
  threshold,
}: {
  pairs: PairBalance[];
  members: Member[];
  threshold: number;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const total = pairs.reduce((a, p) => a + p.net, 0);
  const sorted = [...pairs].sort((a, b) => Math.abs(b.net) - Math.abs(a.net));

  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">Balance neto</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums">
        {total > 0 ? "+" : total < 0 ? "−" : ""}
        {fmtCredits(Math.abs(total))}
        <span className="ml-1 text-base font-normal text-muted">cr.</span>
      </p>
      <p className="text-sm text-muted">
        {total > 0 ? "Te deben en total" : total < 0 ? "Debes en total" : "Estáis en paz"}
      </p>

      <ul className="mt-5 space-y-4">
        {sorted.map((p) => {
          const m = byId.get(p.userId)!;
          const { progress, remaining, rewards } = rewardProgress(p.net, threshold);
          const theyOwe = p.net > 0;
          return (
            <li key={p.userId}>
              <div className="flex items-center gap-3">
                <Avatar name={m.name} id={m.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {p.net === 0
                      ? `En paz con ${m.name}`
                      : theyOwe
                        ? `${m.name} te debe ${fmtCredits(p.net)} cr.`
                        : `Le debes ${fmtCredits(-p.net)} cr. a ${m.name}`}
                  </p>
                  {p.net !== 0 && (
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <Gift size={12} />
                      {rewards > 0
                        ? `${rewards} ${rewards === 1 ? "ronda lista" : "rondas listas"} · `
                        : ""}
                      {remaining} cr. para la próxima ({threshold} = 1 menú)
                    </p>
                  )}
                </div>
              </div>
              {p.net !== 0 && (
                <div
                  className="mt-2 ml-12 h-1.5 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-valuenow={Math.round(progress * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full rounded-full transition-[width] duration-500 ${theyOwe ? "bg-positive" : "bg-accent"}`}
                    style={{ width: `${Math.max(4, progress * 100)}%` }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
