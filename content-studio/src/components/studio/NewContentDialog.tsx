"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, FORMATS, PLATFORMS } from "@/lib/constants";
import type { Category, ContentFormat, Platform } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChipGroup, Field, Select, TextInput } from "@/components/ui/Form";
import { PlatformMark } from "@/components/ui/Badge";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";

export function NewContentDialog({
  open,
  onClose,
  ideaId: presetIdeaId,
  date,
}: {
  open: boolean;
  onClose: () => void;
  ideaId?: string;
  /** Optional publish date to pre-fill on the chosen platform versions (from the calendar). */
  date?: string;
}) {
  const store = useStore();
  const { toast } = useFeedback();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [ideaId, setIdeaId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [format, setFormat] = useState<ContentFormat | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  const ideaOptions = useMemo(
    () =>
      store.ideas
        .filter((i) => i.status !== "used" || i.id === presetIdeaId)
        .sort((a, b) => (a.status === "selected" ? -1 : 0) - (b.status === "selected" ? -1 : 0))
        .map((i) => ({ value: i.id, label: `${i.status === "selected" ? "★ " : ""}${i.title}` })),
    [store.ideas, presetIdeaId],
  );

  useEffect(() => {
    if (!open) return;
    const idea = store.ideas.find((i) => i.id === presetIdeaId);
    setIdeaId(idea?.id ?? null);
    setTitle(idea?.title ?? "");
    setCategory(idea?.category ?? null);
    setFormat(null);
    setPlatforms(date ? ["facebook", "instagram", "tiktok"] : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetIdeaId, date]);

  const pickIdea = (id: string | null) => {
    setIdeaId(id);
    const idea = store.ideas.find((i) => i.id === id);
    if (idea) {
      setTitle(idea.title);
      if (idea.category) setCategory(idea.category);
    }
  };

  const togglePlatform = (p: Platform) =>
    setPlatforms((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const create = () => {
    if (!title.trim()) return;
    const idea = store.ideas.find((i) => i.id === ideaId);
    const item = store.addContent({
      title,
      ideaId: idea?.id ?? null,
      category,
      format,
      status: "producing",
      mainMessage: idea?.details ?? "",
    });
    if (idea && idea.status !== "used") store.updateIdea(idea.id, { status: "used" });
    platforms.forEach((p) => store.addPublication(item.id, p, date ? { scheduledDate: date } : {}));
    onClose();
    toast("สร้างคอนเทนต์แล้ว");
    router.push(`/studio/${item.id}`);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="สร้างคอนเทนต์ใหม่"
      description="ตั้งชื่อก่อน รายละเอียดค่อยเขียนในห้องผลิต"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={create} disabled={!title.trim()}>
            สร้างและเริ่มเขียน
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          create();
        }}
      >
        {ideaOptions.length > 0 && (
          <Field label="เริ่มจากไอเดีย" hint="ไม่บังคับ">
            <Select value={ideaId} onChange={pickIdea} options={ideaOptions} placeholder="— ไม่เลือก —" ariaLabel="เลือกไอเดีย" />
          </Field>
        )}
        <Field label="ชื่อคอนเทนต์">
          <TextInput autoFocus data-autofocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น การเอาชนะความอยาก เริ่มจากเรื่องเล็ก ๆ" />
        </Field>
        <div>
          <p className="mb-2 text-[13px] font-medium">หมวดหมู่</p>
          <ChipGroup value={category} onChange={setCategory} options={CATEGORIES} allowClear size="sm" />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">รูปแบบ</p>
          <ChipGroup value={format} onChange={setFormat} options={FORMATS} allowClear size="sm" />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">
            จะลงช่องทางไหน <span className="font-normal text-faint">· แก้ทีหลังได้{date ? " · ตั้งวันตามที่เลือกในปฏิทิน" : ""}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePlatform(p.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors",
                    on ? "border-primary bg-primary-soft text-ink" : "border-line text-muted hover:border-line-strong",
                  )}
                >
                  <PlatformMark platform={p.value} size="xs" />
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
