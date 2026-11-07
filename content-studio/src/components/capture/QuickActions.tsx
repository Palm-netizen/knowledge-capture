"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { IdeaKind } from "@/lib/types";
import { QuickCaptureDialog } from "./QuickCaptureDialog";
import { NewContentDialog } from "@/components/studio/NewContentDialog";

interface QuickActionsValue {
  openCapture: (opts?: { kind?: IdeaKind }) => void;
  openNewContent: (opts?: { ideaId?: string; date?: string }) => void;
}

const Ctx = createContext<QuickActionsValue | null>(null);

/** Global actions reachable from every page: quick idea capture + new content. */
export function QuickActionsProvider({ children }: { children: React.ReactNode }) {
  const [capture, setCapture] = useState<{ open: boolean; kind?: IdeaKind }>({ open: false });
  const [newContent, setNewContent] = useState<{ open: boolean; ideaId?: string; date?: string }>({ open: false });

  const openCapture = useCallback<QuickActionsValue["openCapture"]>((opts) => setCapture({ open: true, kind: opts?.kind }), []);
  const openNewContent = useCallback<QuickActionsValue["openNewContent"]>(
    (opts) => setNewContent({ open: true, ideaId: opts?.ideaId, date: opts?.date }),
    [],
  );

  // Keyboard shortcut: "N" opens quick capture from anywhere (when not typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      setCapture({ open: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Ctx.Provider value={{ openCapture, openNewContent }}>
      {children}
      <QuickCaptureDialog open={capture.open} defaultKind={capture.kind} onClose={() => setCapture({ open: false })} />
      <NewContentDialog
        open={newContent.open}
        ideaId={newContent.ideaId}
        date={newContent.date}
        onClose={() => setNewContent({ open: false })}
      />
    </Ctx.Provider>
  );
}

export function useQuickActions() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useQuickActions must be used inside <QuickActionsProvider>");
  return ctx;
}
