"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-[fade-in_.2s_ease-out]"
      />
      <div className="relative w-full max-w-md max-h-[88dvh] overflow-y-auto rounded-t-3xl border border-line bg-surface px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] animate-[sheet-up_.28s_cubic-bezier(.22,1,.36,1)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="grid size-9 place-items-center rounded-full bg-surface-2 text-muted">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
