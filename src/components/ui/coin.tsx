import { useId } from "react";
import { cn } from "@/lib/utils";

/** Moneda de Recapi: dorada, con la R en relieve y brillo. */
export function Coin({ size = 16, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={cn("inline-block shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}e`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7c948" />
          <stop offset="1" stopColor="#b97a0a" />
        </linearGradient>
        <linearGradient id={`${id}f`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#ffd34d" />
          <stop offset="1" stopColor="#e9a514" />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* canto */}
      <circle cx="32" cy="33.5" r="29" fill={`url(#${id}e)`} />
      {/* cara */}
      <circle cx="32" cy="31" r="27" fill={`url(#${id}f)`} />
      <circle cx="32" cy="31" r="21.5" fill="none" stroke="#c98a10" strokeOpacity="0.55" strokeWidth="2" />
      {/* R en relieve: sombra + luz */}
      <path d="M25 42 V20 H33 C40 20 43 23.5 43 28 C43 32.5 40 36 33 36 H30 L41 42.5" fill="none" stroke="#a86a05" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" transform="translate(0.8 1.2)" opacity="0.6" />
      <path d="M25 42 V20 H33 C40 20 43 23.5 43 28 C43 32.5 40 36 33 36 H30 L41 42.5" fill="none" stroke="#fff3c4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* brillo */}
      <ellipse cx="22" cy="17" rx="13" ry="7" transform="rotate(-30 22 17)" fill={`url(#${id}s)`} />
    </svg>
  );
}

/** Cantidad de créditos con la moneda al lado. */
export function Credits({
  value,
  size = 14,
  sign,
  className,
}: {
  value: number | string;
  size?: number;
  sign?: "+" | "−";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 tabular-nums", className)}>
      {sign}
      {value}
      <Coin size={size} />
    </span>
  );
}
