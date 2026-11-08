"use client";

import { useState } from "react";
import { dayLabelThai, formatDuration, timeThai } from "@/lib/format";
import { deleteLearningNote, updateLearningNote } from "@/lib/supabase/mutations";
import type { LearningNote } from "@/lib/supabase/types";
import NotePhotos, { HighlightList } from "@/components/notes/NotePhotos";
import { joinHighlights, splitHighlights } from "@/lib/highlights";

const FIELDS = [
  { key: "learned", label: "สิ่งที่ได้เรียนรู้" },
  { key: "thought", label: "ความคิดที่เกิดขึ้น" },
  { key: "will_apply", label: "สิ่งที่จะนำไปใช้" },
  { key: "highlight", label: "ข้อความที่ประทับใจ (บรรทัดละ 1 ประโยค)" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

const inputClass =
  "mt-1 w-full resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

export default function TimelineEntry({
  note,
  verb,
  isLast,
  onUpdated,
  onDeleted,
}: {
  note: LearningNote;
  verb: string;
  isLast: boolean;
  onUpdated: (n: LearningNote) => void;
  onDeleted: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<FieldKey, string>>({
    learned: note.learned,
    thought: note.thought,
    will_apply: note.will_apply,
    highlight: splitHighlights(note.highlight).join("\n"),
  });
  const [minutes, setMinutes] = useState(note.duration_minutes ? String(note.duration_minutes) : "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const highlights = splitHighlights(note.highlight);
  const preview = note.learned || highlights[0] || note.thought || "(ยังไม่มีรายละเอียด)";
  const hasDetails = !!(note.learned || note.thought || note.will_apply || highlights.length || note.image_urls?.length);

  async function handleSave() {
    setBusy(true);
    setErr(null);
    try {
      const updated = await updateLearningNote(note.id, {
        learned: draft.learned.trim(),
        thought: draft.thought.trim(),
        will_apply: draft.will_apply.trim(),
        highlight: joinHighlights(draft.highlight.split("\n")),
        duration_minutes: minutes ? Number(minutes) : null,
      });
      onUpdated(updated);
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("ลบบันทึกครั้งนี้ใช่ไหม?")) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteLearningNote(note);
      onDeleted(note.id);
    } catch {
      setErr("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-accent-light" />
        {!isLast ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
      </div>

      <div className="min-w-0 flex-1 pb-6">
        <button type="button" onClick={() => setOpen((v) => !v)} className="w-full text-left" aria-expanded={open}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-medium text-ink">
              {dayLabelThai(note.captured_at)} · {verb}
            </p>
            <span className="shrink-0 text-xs text-muted">{timeThai(note.captured_at)}</span>
          </div>
          {note.duration_minutes ? (
            <p className="mt-0.5 text-xs text-muted">{formatDuration(note.duration_minutes)}</p>
          ) : null}
          {!open ? <p className="mt-1 line-clamp-1 text-sm text-ink/70">{preview}</p> : null}
        </button>

        {open && !editing ? (
          <div className="mt-3 space-y-3 rounded-2xl bg-panel p-4">
            {FIELDS.filter((f) => f.key !== "highlight" && note[f.key]).map((f) => (
              <div key={f.key}>
                <p className="text-xs font-medium text-muted">{f.label}</p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-ink">{note[f.key]}</p>
              </div>
            ))}
            {highlights.length ? (
              <div>
                <p className="mb-1 text-xs font-medium text-muted">ข้อความที่ประทับใจ</p>
                <HighlightList items={highlights} />
              </div>
            ) : null}
            <NotePhotos urls={note.image_urls} />
            {!hasDetails ? <p className="text-sm text-muted">ยังไม่มีรายละเอียด</p> : null}
            <div className="flex gap-4 pt-1 text-xs">
              <button type="button" onClick={() => setEditing(true)} className="font-medium text-primary hover:underline">
                แก้ไข
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="text-danger hover:underline disabled:opacity-50"
              >
                ลบ
              </button>
            </div>
            {err ? <p className="text-xs text-danger">{err}</p> : null}
          </div>
        ) : null}

        {open && editing ? (
          <div className="mt-3 space-y-3 rounded-2xl bg-panel p-4">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium text-muted">{f.label}</label>
                <textarea
                  rows={2}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  className={inputClass}
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium text-muted">ใช้เวลา (นาที)</label>
              <input type="number" min={0} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={inputClass} />
            </div>
            {err ? <p className="text-xs text-danger">{err}</p> : null}
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={handleSave}
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {busy ? "กำลังบันทึก..." : "บันทึก"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
