"use client";

import { useState } from "react";
import GoalGauge from "./GoalGauge";

export default function WeeklyGoalCard({
  goal,
  done,
  onSave,
}: {
  goal: number | null;
  done: number;
  onSave: (target: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(goal ? String(goal) : "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pct = goal && goal > 0 ? Math.min(100, Math.round((done / goal) * 100)) : 0;

  async function handleSave() {
    const target = Math.round(Number(input));
    if (!Number.isFinite(target) || target <= 0) {
      setErr("ใส่จำนวนไฟล์ที่มากกว่า 0");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await onSave(target);
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-linear-to-br from-hero-from via-hero-via to-hero-to p-6">
      <h2 className="font-display text-xl text-ink">เป้าหมายสัปดาห์นี้</h2>
      <p className="mt-1 text-sm text-muted">จำนวนไฟล์ N21 Mobile ที่จะฟัง</p>

      <div className="mt-6">
        <GoalGauge pct={pct} label="ของเป้าหมาย" />
      </div>

      <p className="mt-4 text-center text-sm text-ink">
        {goal ? `ฟังแล้ว ${done} จาก ${goal} ไฟล์` : `สัปดาห์นี้ฟังแล้ว ${done} ไฟล์ · ยังไม่ได้ตั้งเป้าหมาย`}
      </p>

      <div className="mt-auto pt-5">
        {editing ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="จำนวนไฟล์"
                className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-ink outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setErr(null);
              }}
              className="w-full text-xs text-muted hover:text-ink"
            >
              ยกเลิก
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full rounded-full bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {goal ? "แก้ไขเป้าหมาย" : "ตั้งเป้าหมาย"}
          </button>
        )}
        {err ? <p className="mt-2 text-center text-xs text-danger">{err}</p> : null}
      </div>
    </div>
  );
}
