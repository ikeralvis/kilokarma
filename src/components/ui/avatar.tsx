import { cn, initials } from "@/lib/utils";

const TONES = ["#9aa7e6", "#c2f24a", "#7fe0b8", "#e8e6f2", "#7c8cf0"];

export function Avatar({ name, id, size = 36, className }: { name: string; id: string; size?: number; className?: string }) {
  const tone = TONES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-[#090d1a]", className)}
      style={{ width: size, height: size, background: tone, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
