"use client";

import { useState } from "react";
import GoalGauge from "./GoalGauge";
import { upsertMonthlyHoursGoal } from "@/lib/supabase/mutations";
import { startOfMonthIso } from "@/lib/stats";
import { formatHours } from "@/lib/format";

export default function MonthlyGoalCard({
  goalHours,
  monthMinutes,
  onGoalSaved,
}: {
  goalHours: number | null;
  monthMinutes: number;
  onGoalSaved: (targetHours: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(goalHours ? String(goalHours) : "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pct =
    goalHours && goalHours > 0 ? Math.min(100, Math.round((monthMinutes / 60 / goalHours) * 100)) : 0;

  async function handleSave() {
    const target = Number(input);
    if (!Number.isFinite(target) || target <= 0) {
      setErr("ใส่จำนวนชั่วโมงที่มากกว่า 0");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      await upsertMonthlyHoursGoal(startOfMonthIso(), target);
      onGoalSaved(target);
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-[20px] bg-linear-to-br from-hero-from via-hero-via to-hero-to p-6">
      <h2 className="font-display text-xl text-ink">เป้าหมายเดือนนี้</h2>

      <div className="mt-6">
        <GoalGauge pct={pct} label="ของเป้าหมาย" />
      </div>

      <p className="mt-4 text-center text-sm text-ink">
        {goalHours
          ? `เรียนไปแล้ว ${formatHours(monthMinutes)} จาก ${goalHours} ชม.`
          : "ยังไม่ได้ตั้งเป้าหมายชั่วโมงเรียนรู้"}
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
                placeholder="จำนวนชั่วโมง"
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
            {goalHours ? "แก้ไขเป้าหมาย" : "ตั้งเป้าหมาย"}
          </button>
        )}
        {err ? <p className="mt-2 text-center text-xs text-danger">{err}</p> : null}
      </div>
    </div>
  );
}
