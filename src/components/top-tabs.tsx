"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Recap" },
  { href: "/coche", label: "Coche" },
];

export function TopTabs() {
  const path = usePathname();
  return (
    <nav className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-2 p-1" aria-label="Secciones">
      {TABS.map((t) => {
        const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "grid h-10 place-items-center rounded-xl text-sm font-semibold transition",
              active ? "bg-surface text-fg shadow-sm" : "text-muted",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
