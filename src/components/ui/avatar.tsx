import { cn, initials } from "@/lib/utils";

const TONES = ["#93aab3", "#ff7a5c", "#6fd3b0", "#9aa7e6", "#e0b36a"];

export function Avatar({ name, id, size = 36, className }: { name: string; id: string; size?: number; className?: string }) {
  const tone = TONES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-[#0e1113]", className)}
      style={{ width: size, height: size, background: tone, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
