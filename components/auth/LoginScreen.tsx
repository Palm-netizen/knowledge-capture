"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { loginEmail } from "@/lib/auth";
import ThemeToggle from "@/components/layout/ThemeToggle";
import AppLogo from "@/components/ui/AppLogo";

// Supabase answers "invalid_credentials" both for an unknown account and a
// wrong password, so that message has to cover both.
function loginErrorMessage(code: string | undefined, status: number | undefined, message: string, email: string) {
  switch (code) {
    case "invalid_credentials":
      return `ไม่พบบัญชี ${email} หรือรหัสผ่านไม่ถูกต้อง`;
    case "email_not_confirmed":
      return `บัญชี ${email} ยังไม่ได้ยืนยัน — ต้องยืนยันผู้ใช้ใน Supabase ก่อน`;
    case "email_provider_disabled":
    case "provider_disabled":
      return "การล็อกอินด้วยอีเมลถูกปิดอยู่ใน Supabase";
    case "over_request_rate_limit":
      return "ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่";
  }
  if (!status) return "เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตแล้วลองใหม่";
  return `เข้าสู่ระบบไม่สำเร็จ: ${message}`;
}

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-ink outline-none focus:border-primary";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErr("กรอกชื่อผู้ใช้และรหัสผ่าน");
      return;
    }
    setBusy(true);
    setErr(null);
    const email = loginEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErr(loginErrorMessage(error.code, error.status, error.message, email));
      setBusy(false);
    }
    // On success AuthGate swaps to the app via onAuthStateChange.
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="absolute top-4 right-4">
        <ThemeToggle compact />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <AppLogo className="mx-auto mb-4 h-16 w-16" />
          <p className="font-display text-3xl font-bold text-ink">
            Knowledge Capture<span className="text-primary">.</span>
          </p>
          <p className="mt-2 text-sm text-muted">เข้าสู่ระบบเพื่อเปิดสมุดบันทึกของคุณ</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-[20px] bg-panel p-6">
          <div>
            <label htmlFor="username" className="text-sm text-muted">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-muted">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-3 mt-0.5 -translate-y-1/2 text-xs text-muted hover:text-ink"
              >
                {showPassword ? "ซ่อน" : "แสดง"}
              </button>
            </div>
          </div>
          {err ? <p className="text-sm text-danger">{err}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
