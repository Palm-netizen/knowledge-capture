"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, IDEA_KINDS, IDEA_SOURCES, IDEA_STATUSES } from "@/lib/constants";
import type { Category, Idea, IdeaKind, IdeaSource, IdeaStatus } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, ChipGroup, Field, TextInput } from "@/components/ui/Form";
import { useFeedback } from "@/components/ui/Feedback";

/** Full idea form — used for editing (and creating with all fields). */
export function IdeaDialog({ open, onClose, idea }: { open: boolean; onClose: () => void; idea?: Idea | null }) {
  const { addIdea, updateIdea } = useStore();
  const { toast } = useFeedback();

  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [kind, setKind] = useState<IdeaKind>("content");
  const [source, setSource] = useState<IdeaSource | null>(null);
  const [sourceNote, setSourceNote] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [status, setStatus] = useState<IdeaStatus>("new");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(idea?.title ?? "");
    setDetails(idea?.details ?? "");
    setKind(idea?.kind ?? "content");
    setSource(idea?.source ?? null);
    setSourceNote(idea?.sourceNote ?? "");
    setCategory(idea?.category ?? null);
    setStatus(idea?.status ?? "new");
    setImageUrl(idea?.imageUrl ?? "");
  }, [open, idea]);

  const save = () => {
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      details: details.trim(),
      kind,
      source,
      sourceNote: sourceNote.trim(),
      category,
      status,
      imageUrl: imageUrl.trim() || null,
    };
    if (idea) {
      updateIdea(idea.id, payload);
      toast("บันทึกการแก้ไขแล้ว");
    } else {
      addIdea(payload);
      toast("บันทึกไอเดียแล้ว");
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={idea ? "แก้ไขไอเดีย" : "ไอเดียใหม่"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save} disabled={!title.trim()}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="ไอเดีย">
          <TextInput autoFocus data-autofocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ชื่อหรือประโยคสั้น ๆ" />
        </Field>
        <Field label="รายละเอียด" hint="ไม่บังคับ">
          <AutoTextarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="ความคิดที่อยากเล่า" minRows={3} />
        </Field>
        <div>
          <p className="mb-2 text-[13px] font-medium">ประเภท</p>
          <ChipGroup value={kind} onChange={(v) => v && setKind(v)} options={IDEA_KINDS} size="sm" />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">สถานะ</p>
          <ChipGroup value={status} onChange={(v) => v && setStatus(v)} options={IDEA_STATUSES} size="sm" />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">ที่มาของไอเดีย</p>
          <ChipGroup value={source} onChange={setSource} options={IDEA_SOURCES} allowClear size="sm" />
          <TextInput className="mt-2" value={sourceNote} onChange={(e) => setSourceNote(e.target.value)} placeholder="เช่น ชื่อหนังสือ / คนที่คุยด้วย" />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">หมวดหมู่</p>
          <ChipGroup value={category} onChange={setCategory} options={CATEGORIES} allowClear size="sm" />
        </div>
        <Field label="ลิงก์รูปภาพอ้างอิง" hint="ไม่บังคับ · อัปโหลดรูปจะเพิ่มภายหลัง">
          <TextInput value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" inputMode="url" />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
