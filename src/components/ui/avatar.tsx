import { cn, initials } from "@/lib/utils";

const TONES = ["#9ec4f4", "#b9d3f7", "#7fb0ec", "#c9dcf5", "#8da9e8"];

export function Avatar({ name, id, size = 36, className }: { name: string; id: string; size?: number; className?: string }) {
  const tone = TONES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-full font-semibold text-[#12233d]", className)}
      style={{ width: size, height: size, background: tone, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
