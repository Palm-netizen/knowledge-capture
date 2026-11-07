"use client";

import { useEffect, useState } from "react";
import SourcePicker from "@/components/capture/SourcePicker";
import NoteListItem from "@/components/capture/NoteListItem";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { fetchRecentNotes, type NoteWithSource } from "@/lib/supabase/queries";
import { createLearningNote, createActionItems } from "@/lib/supabase/mutations";

type Mode = "quick" | "deep";
type SelectedSource = { id: string; title: string };

const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5];

export default function CapturePage() {
  const [mode, setMode] = useState<Mode>("quick");
  const [source, setSource] = useState<SelectedSource | null>(null);

  const [quickText, setQuickText] = useState("");

  const [learned, setLearned] = useState("");
  const [thought, setThought] = useState("");
  const [willApply, setWillApply] = useState("");
  const [highlight, setHighlight] = useState("");
  const [importance, setImportance] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [actionInputs, setActionInputs] = useState<string[]>([""]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [notes, setNotes] = useState<NoteWithSource[] | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  async function loadNotes() {
    setNotesError(null);
    try {
      const data = await fetchRecentNotes(20);
      setNotes(data);
    } catch {
      setNotesError("โหลดบันทึกไม่สำเร็จ");
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  function resetForm() {
    setQuickText("");
    setLearned("");
    setThought("");
    setWillApply("");
    setHighlight("");
    setImportance(3);
    setDurationMinutes("");
    setTagsInput("");
    setActionInputs([""]);
    setSource(null);
  }

  async function handleSubmit() {
    setSaveError(null);
    setSavedMessage(null);

    if (mode === "quick" && !quickText.trim()) {
      setSaveError("พิมพ์สิ่งที่อยากจดก่อนนะ");
      return;
    }
    if (mode === "deep" && !learned.trim() && !highlight.trim()) {
      setSaveError('กรอกอย่างน้อย "สิ่งที่ได้เรียนรู้" หรือ "ข้อความที่ประทับใจ"');
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const note = await createLearningNote({
        source_id: source?.id ?? null,
        note_level: mode,
        highlight: mode === "quick" ? quickText.trim() : highlight.trim(),
        learned: mode === "quick" ? quickText.trim() : learned.trim(),
        thought: mode === "deep" ? thought.trim() : "",
        will_apply: mode === "deep" ? willApply.trim() : "",
        importance: mode === "deep" ? importance : 3,
        duration_minutes: mode === "deep" && durationMinutes ? Number(durationMinutes) : null,
        tags: mode === "deep" ? tags : [],
      });

      if (mode === "deep") {
        const items = actionInputs
          .map((a) => a.trim())
          .filter(Boolean)
          .map((action_text) => ({ note_id: note.id, source_id: source?.id ?? null, action_text }));
        await createActionItems(items);
      }

      setSavedMessage(mode === "quick" ? "บันทึก Quick Note แล้ว" : "บันทึก Deep Note แล้ว");
      resetForm();
      loadNotes();
    } catch {
      setSaveError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-3xl text-ink">บันทึก</h1>
        <p className="mt-1 text-muted">จดสิ่งที่ได้เรียนรู้จากหนังสือ, Podcast, วิดีโอ หรือบทความ</p>
      </div>

      <Card className="p-5">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === "quick" ? "bg-primary text-white" : "bg-secondary text-ink"
            }`}
          >
            Quick Note
          </button>
          <button
            type="button"
            onClick={() => setMode("deep")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === "deep" ? "bg-primary text-white" : "bg-secondary text-ink"
            }`}
          >
            Deep Note
          </button>
        </div>

        <div className="space-y-3">
          <SourcePicker value={source} onChange={setSource} />

          {mode === "quick" ? (
            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="จดสิ่งที่อยากจำไว้ตอนนี้เลย..."
              rows={3}
              className="w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
            />
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted">สิ่งที่ได้เรียนรู้</label>
                <textarea
                  value={learned}
                  onChange={(e) => setLearned(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted">ความคิดที่เกิดขึ้น</label>
                <textarea
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted">สิ่งที่จะนำไปใช้</label>
                <textarea
                  value={willApply}
                  onChange={(e) => setWillApply(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm text-muted">ข้อความที่ประทับใจ (ถ้ามี)</label>
                <textarea
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted">ความสำคัญ</label>
                  <div className="mt-1 flex gap-1">
                    {IMPORTANCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setImportance(level)}
                        className={`h-8 w-8 rounded-[8px] border text-sm transition-colors ${
                          level <= importance
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card text-muted"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted">ใช้เวลากี่นาที (ถ้ามี)</label>
                  <input
                    type="number"
                    min={0}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted">แท็ก (คั่นด้วยจุลภาค)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="ธุรกิจ, การเงิน"
                  className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-sm text-muted">สิ่งที่จะลองทำ (ถ้ามี)</label>
                <div className="mt-1 space-y-2">
                  {actionInputs.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          setActionInputs((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                        }
                        placeholder="เช่น ลองทำ... ภายในสัปดาห์นี้"
                        className="flex-1 rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                      />
                      {actionInputs.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => setActionInputs((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-xs text-muted hover:text-accent"
                        >
                          ลบ
                        </button>
                      ) : null}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setActionInputs((prev) => [...prev, ""])}
                    className="text-xs text-primary hover:underline"
                  >
                    + เพิ่มอีกรายการ
                  </button>
                </div>
              </div>
            </div>
          )}

          {saveError ? <p className="text-sm text-accent">{saveError}</p> : null}
          {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full rounded-[10px] bg-primary px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : mode === "quick" ? "บันทึกเลย" : "บันทึก Deep Note"}
          </button>
        </div>
      </Card>

      <section>
        <SectionHeading title="บันทึกที่ผ่านมา" />
        {notesError ? (
          <ErrorState message={notesError} />
        ) : notes === null ? (
          <LoadingState />
        ) : notes.length === 0 ? (
          <EmptyState message="ยังไม่มีบันทึก เริ่มจดด้านบนได้เลย" />
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                onUpdated={(updated) =>
                  setNotes((prev) => (prev ? prev.map((n) => (n.id === updated.id ? updated : n)) : prev))
                }
                onDeleted={(id) => setNotes((prev) => (prev ? prev.filter((n) => n.id !== id) : prev))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
