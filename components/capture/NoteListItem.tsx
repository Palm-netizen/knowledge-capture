"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { NOTE_LEVEL_LABEL } from "@/lib/learning-labels";
import { timeAgoThai } from "@/lib/format";
import { updateLearningNote, deleteLearningNote } from "@/lib/supabase/mutations";
import type { NoteWithSource } from "@/lib/supabase/queries";

export default function NoteListItem({
  note,
  onUpdated,
  onDeleted,
}: {
  note: NoteWithSource;
  onUpdated: (note: NoteWithSource) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [learned, setLearned] = useState(note.learned);
  const [thought, setThought] = useState(note.thought);
  const [willApply, setWillApply] = useState(note.will_apply);
  const [saving, setSaving] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      const updated = await updateLearningNote(note.id, {
        learned: learned.trim(),
        thought: thought.trim(),
        will_apply: willApply.trim(),
      });
      onUpdated({ ...note, ...updated });
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("ลบบันทึกนี้ใช่ไหม?")) return;
    setBusyDelete(true);
    setErr(null);
    try {
      await deleteLearningNote(note.id);
      onDeleted(note.id);
    } catch {
      setErr("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusyDelete(false);
    }
  }

  if (editing) {
    return (
      <Card className="p-4 space-y-2">
        <textarea
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          placeholder="สิ่งที่ได้เรียนรู้"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        <textarea
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="ความคิดที่เกิดขึ้น"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        <textarea
          value={willApply}
          onChange={(e) => setWillApply(e.target.value)}
          placeholder="สิ่งที่จะนำไปใช้"
          rows={2}
          className="w-full resize-none rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        />
        {err ? <p className="text-xs text-accent">{err}</p> : null}
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
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-ink">{note.learned || note.highlight || "(ยังไม่มีรายละเอียด)"}</p>
          {note.thought ? <p className="mt-1 text-sm text-muted">คิดว่า: {note.thought}</p> : null}
          {note.will_apply ? <p className="mt-1 text-sm text-primary">จะนำไปใช้: {note.will_apply}</p> : null}
          <p className="mt-2 text-xs text-muted">
            {note.source?.title ?? "ไม่ได้ผูกกับแหล่งข้อมูล"} · {timeAgoThai(note.captured_at)}
          </p>
        </div>
        <Pill tone={note.note_level === "deep" ? "accent" : "neutral"}>{NOTE_LEVEL_LABEL[note.note_level]}</Pill>
      </div>
      {err ? <p className="mt-2 text-xs text-accent">{err}</p> : null}
      <div className="mt-3 flex gap-3 text-xs">
        <button type="button" onClick={() => setEditing(true)} className="text-primary hover:underline">
          แก้ไข
        </button>
        <button
          type="button"
          disabled={busyDelete}
          onClick={handleDelete}
          className="text-accent hover:underline disabled:opacity-50"
        >
          {busyDelete ? "กำลังลบ..." : "ลบ"}
        </button>
      </div>
    </Card>
  );
}
