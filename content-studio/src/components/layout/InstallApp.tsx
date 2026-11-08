"use client";

import { useEffect, useState } from "react";
import { Download, MoreVertical, Share, SquarePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DiamondMark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * "ติดตั้งแอป" — puts SUPPERPALM on the home screen.
 * Android/desktop Chrome: native install prompt. iPhone: step-by-step guide (Share → Add to Home Screen).
 * Hidden once the app is already opened from the home screen.
 */
export function InstallApp({ variant }: { variant: "topbar" | "sidebar" }) {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installed, setInstalled] = useState(true);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || platform === null) return null;
  // desktop browsers without an install prompt: nothing useful to offer
  if (platform === "other" && !promptEvent) return null;

  const install = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    setGuide(true);
  };

  return (
    <>
      <button
        onClick={install}
        className={cn(
          "flex items-center gap-1.5 font-medium transition-colors",
          variant === "topbar"
            ? "h-8 rounded-full bg-ink px-3 text-[12px] text-white"
            : "mx-3 mb-0 h-10 justify-center rounded-2xl bg-card/70 px-3 text-xs text-ink hover:bg-card lg:mx-4 lg:justify-start",
        )}
        title="เพิ่ม SUPPERPALM ไว้บนหน้าจอโฮม"
      >
        <Download size={14} />
        <span className={variant === "sidebar" ? "hidden lg:inline" : ""}>ติดตั้งแอป</span>
      </button>

      <Modal open={guide} onClose={() => setGuide(false)} title="ติดตั้งเป็นแอปบนมือถือ" size="sm">
        <div className="flex items-center gap-3 rounded-2xl bg-subtle p-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink">
            <DiamondMark size={30} />
          </span>
          <span>
            <span className="block font-semibold">SUPPERPALM</span>
            <span className="block text-xs text-muted">กดไอคอนบนหน้าจอโฮม แล้วเปิดใช้ได้ทันที</span>
          </span>
        </div>
        {platform === "ios" ? (
          <ol className="mt-4 space-y-3 text-[14px]">
            <Step n={1}>
              แตะปุ่ม <b>แชร์</b> <Share size={15} className="inline align-[-2px] text-primary" /> ที่แถบด้านล่างของ Safari
              <span className="block text-xs text-muted">(ถ้าใช้ Chrome บน iPhone ปุ่มแชร์อยู่มุมขวาบน)</span>
            </Step>
            <Step n={2}>
              เลื่อนลงแล้วแตะ <b>“เพิ่มไปยังหน้าจอโฮม”</b> <SquarePlus size={15} className="inline align-[-2px]" />
            </Step>
            <Step n={3}>
              แตะ <b>“เพิ่ม”</b> ที่มุมขวาบน — ไอคอนเพชรจะอยู่บนหน้าจอโฮม
            </Step>
          </ol>
        ) : (
          <ol className="mt-4 space-y-3 text-[14px]">
            <Step n={1}>
              แตะเมนู <MoreVertical size={15} className="inline align-[-2px]" /> มุมขวาบนของ Chrome
            </Step>
            <Step n={2}>
              แตะ <b>“ติดตั้งแอป”</b> หรือ <b>“เพิ่มลงในหน้าจอหลัก”</b>
            </Step>
            <Step n={3}>
              แตะ <b>“ติดตั้ง”</b> — ไอคอนเพชรจะอยู่บนหน้าจอหลัก
            </Step>
          </ol>
        )}
        <Button variant="primary" className="mt-5 w-full" onClick={() => setGuide(false)}>
          เข้าใจแล้ว
        </Button>
      </Modal>
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{n}</span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
