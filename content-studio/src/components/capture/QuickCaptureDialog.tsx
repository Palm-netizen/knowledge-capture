"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ChevronDown, X } from "lucide-react";
import { CATEGORIES, IDEA_KINDS, IDEA_SOURCES } from "@/lib/constants";
import type { Category, IdeaKind, IdeaSource } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, ChipGroup, Field, TextInput } from "@/components/ui/Form";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";
import { savePhoto } from "@/lib/image";

/**
 * "Capture Everything" — type, pick a kind, Enter. That's it.
 * Extra fields are tucked behind "เพิ่มรายละเอียด" and never required.
 */
export function QuickCaptureDialog({
  open,
  onClose,
  defaultKind,
}: {
  open: boolean;
  onClose: () => void;
  defaultKind?: IdeaKind;
}) {
  const { addIdea, updateIdea, syncMode } = useStore();
  const { toast } = useFeedback();
  const router = useRouter();

  const [text, setText] = useState("");
  const [kind, setKind] = useState<IdeaKind>("content");
  const [more, setMore] = useState(false);
  const [details, setDetails] = useState("");
  const [source, setSource] = useState<IdeaSource | null>(null);
  const [sourceNote, setSourceNote] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [photo, setPhoto] = useState<{ file: File; preview: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setKind(defaultKind ?? "content");
      setMore(false);
      setDetails("");
      setSource(null);
      setSourceNote("");
      setCategory(null);
      setPhoto(null);
    }
  }, [open, defaultKind]);

  // free the preview URL when the photo changes or the dialog closes
  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  const canSave = text.trim().length > 0 || !!photo;

  const save = () => {
    if (!canSave) return;
    // First line becomes the title; anything after it goes to details.
    const [first, ...rest] = text.trim().split("\n");
    const extra = rest.join("\n").trim();
    const idea = addIdea({
      title: first || "ไอเดียจากรูป",
      details: [extra, details.trim()].filter(Boolean).join("\n\n"),
      kind,
      source,
      sourceNote: sourceNote.trim(),
      category,
    });
    // upload the photo in the background so saving stays instant
    if (photo) {
      const file = photo.file;
      savePhoto(`ideas/${idea.id}.jpg`, file, { remote: syncMode === "supabase" })
        .then(({ url }) => updateIdea(idea.id, { imageUrl: url }))
        .catch(() => toast("อัปโหลดรูปไม่สำเร็จ — ไอเดียบันทึกแล้ว", { tone: "error" }));
    }
    onClose();
    toast("บันทึกไอเดียแล้ว", { action: { label: "ดูใน Inbox", onClick: () => router.push("/ideas") } });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="บันทึกไอเดีย"
      description="พิมพ์สั้น ๆ ก็พอ — กด Enter เพื่อบันทึก"
      footer={
        <>
          <span className="mr-auto hidden text-xs text-faint md:inline">Shift + Enter ขึ้นบรรทัดใหม่</span>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            บันทึก
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <AutoTextarea
          autoFocus
          data-autofocus
          minRows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="คิดอะไรได้ จดไว้ก่อน… เช่น “คนซื้อซ้ำเพราะเห็นคุณค่า ไม่ใช่เพราะเราตามเก่ง”"
          className="text-[15px]!"
        />

        {/* photo */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPhoto({ file: f, preview: URL.createObjectURL(f) });
            e.target.value = "";
          }}
        />
        {photo ? (
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.preview} alt="รูปประกอบไอเดีย" className="h-28 max-w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={() => setPhoto(null)}
              aria-label="เอารูปออก"
              className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-pop"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2 text-[13px] text-muted hover:border-primary hover:text-primary"
          >
            <Camera size={16} /> ใส่รูป (ถ่ายหรือเลือกจากเครื่อง)
          </button>
        )}

        <div>
          <p className="mb-2 text-[13px] font-medium">นี่คือ…</p>
          <ChipGroup value={kind} onChange={(v) => v && setKind(v)} options={IDEA_KINDS} />
        </div>

        <button
          type="button"
          onClick={() => setMore((m) => !m)}
          className="flex items-center gap-1 text-[13px] text-muted hover:text-ink"
          aria-expanded={more}
        >
          <ChevronDown size={15} className={cn("transition-transform", more && "rotate-180")} />
          {more ? "ซ่อนรายละเอียด" : "เพิ่มรายละเอียด (ไม่บังคับ)"}
        </button>

        {more && (
          <div className="animate-fade space-y-4 rounded-lg bg-subtle/60 p-4">
            <Field label="รายละเอียด">
              <AutoTextarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="ความคิดที่อยากเล่าเพิ่ม" />
            </Field>
            <div>
              <p className="mb-2 text-[13px] font-medium">ที่มาของไอเดีย</p>
              <ChipGroup value={source} onChange={setSource} options={IDEA_SOURCES} allowClear size="sm" />
              <TextInput
                className="mt-2"
                value={sourceNote}
                onChange={(e) => setSourceNote(e.target.value)}
                placeholder="เช่น ชื่อหนังสือ / Podcast / คนที่คุยด้วย"
              />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">หมวดหมู่</p>
              <ChipGroup value={category} onChange={setCategory} options={CATEGORIES} allowClear size="sm" />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
