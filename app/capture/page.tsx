"use client";

import { useEffect, useState, type ReactNode } from "react";
import SourcePicker from "@/components/capture/SourcePicker";
import NoteListItem from "@/components/capture/NoteListItem";
import PhotoPicker, { type PendingPhoto } from "@/components/notes/PhotoPicker";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { BookIcon, HeadphonesIcon, MicIcon } from "@/components/ui/icons";
import { fetchRecentNotes, type NoteWithSource } from "@/lib/supabase/queries";
import {
  createActionItems,
  createLearningNote,
  removeStoredPhotos,
  uploadNotePhotos,
} from "@/lib/supabase/mutations";
import { CAPTURE_KINDS, kindOf, type CaptureKind } from "@/lib/kinds";
import { joinHighlights } from "@/lib/highlights";

type Mode = "quick" | "deep";
type SelectedSource = { id: string; title: string };

const IMPORTANCE_LEVELS = [1, 2, 3, 4, 5];
const KIND_KEY = "kc-capture-kind";
const KIND_ICONS: Record<CaptureKind, ReactNode> = {
  reading: <BookIcon />,
  n21: <HeadphonesIcon />,
  podcast: <MicIcon />,
};

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary";
const textareaClass = `${inputClass} resize-none`;

function ListInputs({
  label,
  placeholder,
  addLabel,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  addLabel: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <label className="text-sm text-muted">{label}</label>
      <div className="mt-1 space-y-2">
        {values.map((val, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={val}
              maxLength={200}
              onChange={(e) => onChange(values.map((v, i) => (i === idx ? e.target.value : v)))}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
            />
            {values.length > 1 ? (
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== idx))}
                className="text-xs text-muted hover:text-danger"
              >
                ลบ
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" onClick={() => onChange([...values, ""])} className="text-xs font-medium text-primary hover:underline">
          {addLabel}
        </button>
      </div>
    </div>
  );
}

export default function CapturePage() {
  const [kind, setKind] = useState<CaptureKind>("n21");
  const [mode, setMode] = useState<Mode>("quick");
  const [source, setSource] = useState<SelectedSource | null>(null);

  const [quickText, setQuickText] = useState("");

  const [learned, setLearned] = useState("");
  const [thought, setThought] = useState("");
  const [willApply, setWillApply] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [importance, setImportance] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [actionInputs, setActionInputs] = useState<string[]>([""]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [notes, setNotes] = useState<NoteWithSource[] | null>(null);
  const [notesError, setNotesError] = useState<string | null>(null);

  const kindConfig = CAPTURE_KINDS.find((k) => k.value === kind) ?? CAPTURE_KINDS[0];

  async function loadNotes() {
    setNotesError(null);
    try {
      setNotes(await fetchRecentNotes(80));
    } catch {
      setNotesError("โหลดบันทึกไม่สำเร็จ");
    }
  }

  useEffect(() => {
    loadNotes();
    try {
      const saved = localStorage.getItem(KIND_KEY);
      if (saved && CAPTURE_KINDS.some((k) => k.value === saved)) setKind(saved as CaptureKind);
    } catch {
      // Storage unavailable — fall back to the default kind.
    }
  }, []);

  function changeKind(next: CaptureKind) {
    if (next === kind) return;
    setKind(next);
    setSource(null);
    setSaveError(null);
    try {
      localStorage.setItem(KIND_KEY, next);
    } catch {
      // Not remembering the choice is fine.
    }
  }

  function resetForm() {
    setQuickText("");
    setLearned("");
    setThought("");
    setWillApply("");
    setHighlights([""]);
    setImportance(3);
    setDurationMinutes("");
    setTagsInput("");
    setActionInputs([""]);
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setSource(null);
  }

  async function handleSubmit() {
    setSaveError(null);
    setSavedMessage(null);

    const highlightText = joinHighlights(highlights);
    if (!source) {
      setSaveError(`เลือกหรือพิมพ์ชื่อ${kindConfig.pickerLabel}ก่อนนะ`);
      return;
    }
    if (mode === "quick" && !quickText.trim()) {
      setSaveError("พิมพ์สิ่งที่อยากจดก่อนนะ");
      return;
    }
    if (mode === "deep" && !learned.trim() && !thought.trim() && !highlightText) {
      setSaveError('กรอกอย่างน้อย "สิ่งที่ได้เรียนรู้" หรือ "ข้อความที่ประทับใจ"');
      return;
    }

    setSaving(true);
    let imageUrls: string[] = [];
    try {
      imageUrls = photos.length ? await uploadNotePhotos(photos.map((p) => p.blob)) : [];
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const note = await createLearningNote({
        source_id: source.id,
        note_level: mode,
        learned: mode === "quick" ? quickText.trim() : learned.trim(),
        highlight: mode === "deep" ? highlightText : "",
        thought: mode === "deep" ? thought.trim() : "",
        will_apply: mode === "deep" ? willApply.trim() : "",
        importance: mode === "deep" ? importance : 3,
        duration_minutes: mode === "deep" && durationMinutes ? Number(durationMinutes) : null,
        tags: mode === "deep" ? tags : [],
        image_urls: imageUrls,
      });

      if (mode === "deep") {
        const items = actionInputs
          .map((a) => a.trim())
          .filter(Boolean)
          .map((action_text) => ({ note_id: note.id, source_id: source.id, action_text }));
        await createActionItems(items);
      }

      setSavedMessage(mode === "quick" ? "บันทึก Quick Note แล้ว" : "บันทึก Deep Note แล้ว");
      resetForm();
      loadNotes();
    } catch {
      if (imageUrls.length) await removeStoredPhotos(imageUrls);
      setSaveError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const kindNotes = (notes ?? []).filter((n) => n.source && kindOf(n.source) === kind);

  return (
    <div className="px-5 py-8 md:px-12 md:py-12 max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-4xl text-ink">บันทึก</h1>
        <p className="mt-2 text-muted">เลือกหมวดก่อน แล้วจดสิ่งที่ได้เรียนรู้</p>
      </div>

      {/* หมวด */}
      <div className="grid grid-cols-3 gap-3">
        {CAPTURE_KINDS.map((k) => {
          const active = k.value === kind;
          return (
            <button
              key={k.value}
              type="button"
              onClick={() => changeKind(k.value)}
              aria-pressed={active}
              className={`flex flex-col items-center gap-2 rounded-[20px] px-3 py-4 text-sm font-medium transition-colors ${
                active ? "bg-nav text-white" : "bg-panel text-ink hover:bg-secondary"
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  active ? "bg-white/15 text-white" : "bg-accent-light text-primary"
                }`}
              >
                {KIND_ICONS[k.value]}
              </span>
              {k.label}
            </button>
          );
        })}
      </div>

      <Card className="p-5">
        <div className="flex gap-2 mb-4">
          {(["quick", "deep"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                mode === m ? "bg-primary text-white" : "bg-secondary text-ink"
              }`}
            >
              {m === "quick" ? "Quick Note" : "Deep Note"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <SourcePicker kind={kindConfig} value={source} onChange={setSource} />

          {mode === "quick" ? (
            <textarea
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder="จดสิ่งที่อยากจำไว้ตอนนี้เลย..."
              rows={3}
              className={textareaClass}
            />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted">สิ่งที่ได้เรียนรู้</label>
                <textarea value={learned} onChange={(e) => setLearned(e.target.value)} rows={2} className={textareaClass} />
              </div>
              <div>
                <label className="text-sm text-muted">ความคิดที่เกิดขึ้น</label>
                <textarea value={thought} onChange={(e) => setThought(e.target.value)} rows={2} className={textareaClass} />
              </div>
              <div>
                <label className="text-sm text-muted">สิ่งที่จะนำไปใช้</label>
                <textarea value={willApply} onChange={(e) => setWillApply(e.target.value)} rows={2} className={textareaClass} />
              </div>

              <ListInputs
                label="ข้อความที่ประทับใจ (ประโยคสั้น ๆ — เก็บเข้าคลังคำพูด)"
                placeholder="เช่น ฝันให้ใหญ่ แล้วลงมือทีละก้าว"
                addLabel="+ เพิ่มอีกประโยค"
                values={highlights}
                onChange={setHighlights}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted">ความสำคัญ</label>
                  <div className="mt-1 flex gap-1">
                    {IMPORTANCE_LEVELS.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setImportance(level)}
                        className={`h-8 w-8 rounded-lg border text-sm transition-colors ${
                          level <= importance ? "border-primary bg-primary text-white" : "border-border bg-card text-muted"
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
                    className={inputClass}
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
                  className={inputClass}
                />
              </div>

              <ListInputs
                label="สิ่งที่จะลองทำ (ถ้ามี)"
                placeholder="เช่น ลองทำ... ภายในสัปดาห์นี้"
                addLabel="+ เพิ่มอีกรายการ"
                values={actionInputs}
                onChange={setActionInputs}
              />
            </div>
          )}

          <PhotoPicker photos={photos} onChange={setPhotos} />

          {saveError ? <p className="text-sm text-danger">{saveError}</p> : null}
          {savedMessage ? <p className="text-sm text-good">{savedMessage}</p> : null}

          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "กำลังบันทึก..." : mode === "quick" ? "บันทึกเลย" : "บันทึก Deep Note"}
          </button>
        </div>
      </Card>

      <section>
        <SectionHeading title={`บันทึก${kindConfig.label}ที่ผ่านมา`} />
        {notesError ? (
          <ErrorState message={notesError} />
        ) : notes === null ? (
          <LoadingState />
        ) : kindNotes.length === 0 ? (
          <EmptyState message={`ยังไม่มีบันทึก${kindConfig.label} เริ่มจดด้านบนได้เลย`} />
        ) : (
          <div className="space-y-3">
            {kindNotes.map((note) => (
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
