"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { loginEmail } from "@/lib/auth";
import ThemeToggle from "@/components/layout/ThemeToggle";

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
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(username), password });
    if (error) {
      setErr(
        error.status === 400 || /invalid/i.test(error.message)
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง"
      );
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
