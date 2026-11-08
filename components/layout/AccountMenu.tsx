"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { displayName } from "@/lib/auth";
import { downloadFullBackup, downloadNotesCsv } from "@/lib/backup";
import { useSession } from "@/components/auth/AuthGate";
import ThemeToggle from "./ThemeToggle";

type Job = "json" | "csv" | null;

function useBackup() {
  const [running, setRunning] = useState<Job>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(job: Exclude<Job, null>) {
    setRunning(job);
    setMessage(null);
    try {
      await (job === "json" ? downloadFullBackup() : downloadNotesCsv());
      setMessage("ดาวน์โหลดแล้ว ✓");
    } catch {
      setMessage("สำรองข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setRunning(null);
    }
  }

  return { running, message, run };
}

async function signOut() {
  if (!window.confirm("ออกจากระบบใช่ไหม?")) return;
  await supabase.auth.signOut();
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path
        d="M14 5h3.5A1.5 1.5 0 0 1 19 6.5v11a1.5 1.5 0 0 1-1.5 1.5H14M10 16l-4-4 4-4M6 12h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const rowClass =
  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-ink/70 transition-colors hover:bg-secondary hover:text-ink disabled:opacity-50";

export function SidebarAccount() {
  const session = useSession();
  const { running, message, run } = useBackup();
  const [showBackup, setShowBackup] = useState(false);

  return (
    <div className="space-y-1 border-t border-border pt-4">
      <p className="px-4 pb-2 text-xs text-muted">
        เข้าสู่ระบบเป็น <span className="font-semibold text-ink">{displayName(session?.user.email)}</span>
      </p>
      <ThemeToggle />
      <button type="button" onClick={() => setShowBackup((v) => !v)} className={rowClass} aria-expanded={showBackup}>
        <DownloadIcon />
        สำรองข้อมูล
      </button>
      {showBackup ? (
        <div className="space-y-1 pl-12 pb-1">
          <button
            type="button"
            disabled={running !== null}
            onClick={() => run("json")}
            className="block text-left text-sm text-primary hover:underline disabled:opacity-50"
          >
            {running === "json" ? "กำลังเตรียมไฟล์..." : "ข้อมูลทั้งหมด (JSON)"}
          </button>
          <button
            type="button"
            disabled={running !== null}
            onClick={() => run("csv")}
            className="block text-left text-sm text-primary hover:underline disabled:opacity-50"
          >
            {running === "csv" ? "กำลังเตรียมไฟล์..." : "บันทึกเป็นตาราง (Excel)"}
          </button>
          {message ? <p className="text-xs text-muted">{message}</p> : null}
        </div>
      ) : null}
      <button type="button" onClick={signOut} className={rowClass}>
        <LogoutIcon />
        ออกจากระบบ
      </button>
    </div>
  );
}

export function MobileAccountMenu() {
  const session = useSession();
  const { running, message, run } = useBackup();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="เมนูบัญชี"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-panel text-lg leading-none text-ink transition-colors hover:bg-secondary"
      >
        ⋯
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute right-0 z-40 mt-2 w-64 space-y-1 rounded-2xl border border-border bg-card p-2 shadow-lg">
            <p className="px-3 py-2 text-xs text-muted">
              เข้าสู่ระบบเป็น <span className="font-semibold text-ink">{displayName(session?.user.email)}</span>
            </p>
            <button type="button" disabled={running !== null} onClick={() => run("json")} className={rowClass}>
              <DownloadIcon />
              {running === "json" ? "กำลังเตรียมไฟล์..." : "สำรองข้อมูลทั้งหมด (JSON)"}
            </button>
            <button type="button" disabled={running !== null} onClick={() => run("csv")} className={rowClass}>
              <DownloadIcon />
              {running === "csv" ? "กำลังเตรียมไฟล์..." : "บันทึกเป็นตาราง (Excel)"}
            </button>
            {message ? <p className="px-4 pb-1 text-xs text-muted">{message}</p> : null}
            <button type="button" onClick={signOut} className={rowClass}>
              <LogoutIcon />
              ออกจากระบบ
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
