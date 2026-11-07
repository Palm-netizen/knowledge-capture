"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import { formatThaiDate } from "@/lib/format";
import { updateReflection, deleteReflection } from "@/lib/supabase/mutations";
import type { Reflection } from "@/lib/supabase/types";

export default function ReflectionCard({
  reflection,
  onUpdated,
  onDeleted,
}: {
  reflection: Reflection;
  onUpdated: (r: Reflection) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [keyLessons, setKeyLessons] = useState(reflection.key_lessons);
  const [applied, setApplied] = useState(reflection.applied_summary);
  const [improve, setImprove] = useState(reflection.improve_summary);
  const [text, setText] = useState(reflection.reflection_text);
  const [saving, setSaving] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateReflection(reflection.id, {
        key_lessons: keyLessons.trim(),
        applied_summary: applied.trim(),
        improve_summary: improve.trim(),
        reflection_text: text.trim(),
      });
      onUpdated(updated);
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("ลบรีเฟลกชันนี้ใช่ไหม?")) return;
    setBusyDelete(true);
    setErr(null);
    try {
      await deleteReflection(reflection.id);
      onDeleted(reflection.id);
    } catch {
      setErr("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusyDelete(false);
    }
  }

  const periodLabel = reflection.period_type === "weekly" ? "สัปดาห์ของ" : "วันที่";

  if (editing) {
    return (
      <Card className="p-4 space-y-2">
        <textarea
          value={keyLessons}
          onChange={(e) => setKeyLessons(e.target.value)}
          placeholder="บทเรียนสำคัญ"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        <textarea
          value={applied}
          onChange={(e) => setApplied(e.target.value)}
          placeholder="สิ่งที่ทำไปแล้ว"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        <textarea
          value={improve}
          onChange={(e) => setImprove(e.target.value)}
          placeholder="สิ่งที่ต้องปรับปรุง"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="สรุปสั้น ๆ"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        {err ? <p className="text-xs text-danger">{err}</p> : null}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-[8px] bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-[8px] border border-border px-3 py-1.5 text-sm text-muted"
          >
            ยกเลิก
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-2">
      <p className="text-xs text-muted">
        {periodLabel} {formatThaiDate(reflection.period_start, { short: true })}
      </p>
      {reflection.reflection_text ? (
        <p className="italic text-ink">&ldquo;{reflection.reflection_text}&rdquo;</p>
      ) : null}
      {reflection.key_lessons ? (
        <p className="text-sm text-ink">
          <span className="text-muted">บทเรียน: </span>
          {reflection.key_lessons}
        </p>
      ) : null}
      {reflection.applied_summary ? (
        <p className="text-sm text-primary">
          <span className="text-muted">ทำไปแล้ว: </span>
          {reflection.applied_summary}
        </p>
      ) : null}
      {reflection.improve_summary ? (
        <p className="text-sm text-warn">
          <span className="text-muted">ต้องปรับปรุง: </span>
          {reflection.improve_summary}
        </p>
      ) : null}
      {err ? <p className="text-xs text-danger">{err}</p> : null}
      <div className="flex gap-3 pt-1 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-primary hover:underline">
          แก้ไข
        </button>
        <button
          type="button"
          disabled={busyDelete}
          onClick={handleDelete}
          className="text-danger hover:underline disabled:opacity-50"
        >
          {busyDelete ? "กำลังลบ..." : "ลบ"}
        </button>
      </div>
    </Card>
  );
}
