"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { updateLearningSource } from "@/lib/supabase/mutations";
import { itemNoun } from "@/lib/learning-labels";
import type { LearningSource } from "@/lib/supabase/types";

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// PostgREST answers PGRST204 when the summary/audience columns haven't
// been added to the database yet.
function saveErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "PGRST204" || code === "42703") {
    return "ฐานข้อมูลยังไม่มีช่องเก็บสรุป ต้องรัน SQL เพิ่มคอลัมน์ summary / audience ใน Supabase ก่อน";
  }
  return "บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง";
}

// Asked when pressing "เรียนจบแล้ว", and reused to edit the summary later.
export function FinishForm({
  source,
  finishing,
  onSaved,
  onCancel,
}: {
  source: LearningSource;
  finishing: boolean;
  onSaved: (updated: LearningSource) => void;
  onCancel: () => void;
}) {
  const noun = itemNoun(source);
  const [summary, setSummary] = useState(source.summary ?? "");
  const [audience, setAudience] = useState(source.audience ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!summary.trim()) {
      setError(`เขียนสั้น ๆ ว่า${noun}พูดเรื่องอะไร`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateLearningSource(source.id, {
        summary: summary.trim(),
        audience: audience.trim(),
        ...(finishing ? { status: "completed" as const, finished_at: todayIso() } : {}),
      });
      onSaved(updated);
    } catch (err) {
      setError(saveErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-3 p-5">
      <div>
        <h2 className="font-display text-lg text-ink">{finishing ? `สรุปก่อนจบ${noun}` : `แก้ไขสรุป${noun}`}</h2>
        {finishing ? (
          <p className="mt-1 text-sm text-muted">เรียนจบ = เข้าใจ{noun}ทั้งหมดแล้ว ลองสรุปด้วยคำพูดของตัวเอง</p>
        ) : null}
      </div>
      <div>
        <label className="text-sm text-muted">{noun}พูดเรื่องอะไร</label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => {
            setSummary(e.target.value);
            setError(null);
          }}
          placeholder="ใจความหลักสั้น ๆ"
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm text-muted">เหมาะกับใคร</label>
        <textarea
          rows={2}
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="เช่น คนที่เพิ่งเริ่มธุรกิจ, คนที่กำลังท้อ"
          className={inputClass}
        />
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "กำลังบันทึก..." : finishing ? "บันทึกและเรียนจบ" : "บันทึก"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-border px-5 py-2 text-sm text-muted">
          ยกเลิก
        </button>
      </div>
    </Card>
  );
}

export function SummaryCard({ source, onEdit }: { source: LearningSource; onEdit: () => void }) {
  const noun = itemNoun(source);
  const summary = source.summary ?? "";
  const audience = source.audience ?? "";

  if (!summary && !audience) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-panel px-5 py-4">
        <p className="text-sm text-muted">ยังไม่ได้สรุปว่า{noun}พูดเรื่องอะไร และเหมาะกับใคร</p>
        <button type="button" onClick={onEdit} className="text-sm font-medium text-primary hover:underline">
          + เพิ่มสรุป
        </button>
      </div>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg text-ink">สรุป{noun}</h2>
        <button type="button" onClick={onEdit} className="shrink-0 text-sm font-medium text-primary hover:underline">
          แก้ไข
        </button>
      </div>
      <dl className="mt-3 space-y-3">
        {summary ? (
          <div>
            <dt className="text-xs font-medium text-muted">พูดเรื่องอะไร</dt>
            <dd className="mt-0.5 whitespace-pre-line text-ink">{summary}</dd>
          </div>
        ) : null}
        {audience ? (
          <div>
            <dt className="text-xs font-medium text-muted">เหมาะกับใคร</dt>
            <dd className="mt-0.5 whitespace-pre-line text-ink">{audience}</dd>
          </div>
        ) : null}
      </dl>
    </Card>
  );
}
