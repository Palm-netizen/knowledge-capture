"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dialog: centered card on desktop, bottom sheet on mobile.
 * Closes on Esc / backdrop click. Locks body scroll while open.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    // focus the first field unless something inside already has focus (autoFocus)
    const t = setTimeout(() => {
      const panel = panelRef.current;
      if (panel && !panel.contains(document.activeElement)) {
        panel.querySelector<HTMLElement>("[data-autofocus], input, textarea, select, button")?.focus();
      }
    }, 30);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const width = size === "sm" ? "md:max-w-sm" : size === "lg" ? "md:max-w-2xl" : "md:max-w-lg";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-[#15171c]/35" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col bg-card shadow-pop",
          "animate-sheet rounded-t-2xl md:animate-pop md:rounded-2xl",
          width,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong md:hidden" />
        {title && (
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-2 md:pt-5">
            <div>
              <h2 className="text-base font-semibold">{title}</h2>
              {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
            </div>
            <button onClick={onClose} className="-mr-1.5 rounded-md p-1.5 text-muted hover:bg-subtle hover:text-ink" aria-label="ปิด">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 pt-2 pb-5">{children}</div>
        {footer && <div className="pb-safe flex items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
