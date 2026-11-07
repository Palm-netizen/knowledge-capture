"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

// ---- Toasts + confirm dialog in one provider ---------------------------

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
  action?: { label: string; onClick: () => void };
}

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface FeedbackValue {
  toast: (message: string, opts?: { tone?: Toast["tone"]; action?: Toast["action"] }) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const counter = useRef(0);

  const toast = useCallback<FeedbackValue["toast"]>((message, opts) => {
    const id = ++counter.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone: opts?.tone ?? "success", action: opts?.action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts?.action ? 5000 : 2800);
  }, []);

  const confirm = useCallback<FeedbackValue["confirm"]>((opts) => {
    setConfirmState(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (v: boolean) => {
    resolver.current?.(v);
    resolver.current = null;
    setConfirmState(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end md:px-6">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="animate-pop pointer-events-auto flex items-center gap-3 rounded-lg bg-ink px-4 py-2.5 text-sm text-white shadow-pop">
            {t.tone === "success" ? <CheckCircle2 size={16} className="text-[#8FD3AE]" /> : <AlertCircle size={16} className="text-[#F5A97F]" />}
            <span>{t.message}</span>
            {t.action && (
              <button
                className="ml-1 font-medium text-[#8FD3AE] hover:underline"
                onClick={() => {
                  t.action!.onClick();
                  setToasts((all) => all.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={!!confirmState}
        onClose={() => settle(false)}
        title={confirmState?.title}
        description={confirmState?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              ยกเลิก
            </Button>
            <Button variant={confirmState?.danger ? "danger" : "primary"} onClick={() => settle(true)} data-autofocus>
              {confirmState?.confirmLabel ?? "ยืนยัน"}
            </Button>
          </>
        }
      >
        <span />
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
}
