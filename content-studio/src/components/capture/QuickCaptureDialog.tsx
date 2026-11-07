"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { CATEGORIES, IDEA_KINDS, IDEA_SOURCES } from "@/lib/constants";
import type { Category, IdeaKind, IdeaSource } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, ChipGroup, Field, TextInput } from "@/components/ui/Form";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";

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
  const { addIdea } = useStore();
  const { toast } = useFeedback();
  const router = useRouter();

  const [text, setText] = useState("");
  const [kind, setKind] = useState<IdeaKind>("content");
  const [more, setMore] = useState(false);
  const [details, setDetails] = useState("");
  const [source, setSource] = useState<IdeaSource | null>(null);
  const [sourceNote, setSourceNote] = useState("");
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (open) {
      setText("");
      setKind(defaultKind ?? "content");
      setMore(false);
      setDetails("");
      setSource(null);
      setSourceNote("");
      setCategory(null);
    }
  }, [open, defaultKind]);

  const canSave = text.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    // First line becomes the title; anything after it goes to details.
    const [first, ...rest] = text.trim().split("\n");
    const extra = rest.join("\n").trim();
    addIdea({
      title: first,
      details: [extra, details.trim()].filter(Boolean).join("\n\n"),
      kind,
      source,
      sourceNote: sourceNote.trim(),
      category,
    });
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
