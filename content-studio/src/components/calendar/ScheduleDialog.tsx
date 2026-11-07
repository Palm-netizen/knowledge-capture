"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, FORMATS, PLATFORMS } from "@/lib/constants";
import type { Category, ContentFormat, Platform } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChipGroup, Field, Segmented, Select, TextInput } from "@/components/ui/Form";
import { PlatformMark } from "@/components/ui/Badge";
import { useFeedback } from "@/components/ui/Feedback";
import { fmt, parseDateStr } from "@/lib/date";
import { studioHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

type Mode = "new" | "existing";

/**
 * Plan a day from the calendar:
 *  - "คอนเทนต์ใหม่": type a title → a draft content + its platform versions are created on that day
 *  - "จากที่มีอยู่": put an existing content on that day
 * Stays on the calendar so several days can be planned in a row.
 */
export function ScheduleDialog({ date, onClose }: { date: string | null; onClose: () => void }) {
  const store = useStore();
  const { toast } = useFeedback();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("new");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [format, setFormat] = useState<ContentFormat | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [time, setTime] = useState("");

  const options = useMemo(
    () =>
      store.contents
        .filter((c) => c.status !== "published")
        .sort((a, b) => (a.status === "ready" ? -1 : 1) - (b.status === "ready" ? -1 : 1))
        .map((c) => ({ value: c.id, label: `${c.status === "ready" ? "✓ " : ""}${c.title}` })),
    [store.contents],
  );

  useEffect(() => {
    if (!date) return;
    setMode("new");
    setTitle("");
    setCategory(null);
    setFormat(null);
    setContentId(null);
    setPlatforms(["facebook", "instagram", "tiktok"]);
    setTime("");
  }, [date]);

  if (!date) return null;
  const dayLabel = fmt.short(parseDateStr(date));

  const canSave = platforms.length > 0 && (mode === "new" ? !!title.trim() : !!contentId);

  const save = () => {
    if (!canSave) return;
    if (mode === "new") {
      const item = store.addContent({ title, category, format, status: "draft" });
      platforms.forEach((p) => store.addPublication(item.id, p, { scheduledDate: date, scheduledTime: time || null }));
      toast(`วางแผน “${item.title}” วันที่ ${dayLabel} แล้ว`, {
        action: { label: "เปิดเขียน", onClick: () => router.push(studioHref(item.id)) },
      });
    } else {
      platforms.forEach((p) => {
        const existing = store.publications.find((x) => x.contentId === contentId && x.platform === p);
        if (existing) store.updatePublication(existing.id, { scheduledDate: date, scheduledTime: time || existing.scheduledTime });
        else store.addPublication(contentId!, p, { scheduledDate: date, scheduledTime: time || null });
      });
      toast(`วางโพสต์วันที่ ${dayLabel} แล้ว`);
    }
    onClose();
  };

  return (
    <Modal
      open={!!date}
      onClose={onClose}
      title="วางแผนคอนเทนต์"
      description={fmt.long(parseDateStr(date))}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            {mode === "new" ? "วางแผน" : "วางโพสต์"}
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
        <Segmented<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: "new", label: "คอนเทนต์ใหม่" },
            { value: "existing", label: "เลือกจากที่มีอยู่", count: options.length },
          ]}
          className="mx-0 px-0"
        />

        {mode === "new" ? (
          <>
            <Field label="หัวข้อคอนเทนต์" hint="รายละเอียดค่อยเขียนทีหลัง">
              <TextInput
                autoFocus
                data-autofocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น 3 เคล็ดลับดูแลสวนปาล์มหน้าฝน"
              />
            </Field>
            <div>
              <p className="mb-2 text-[13px] font-medium">หมวดหมู่</p>
              <ChipGroup value={category} onChange={setCategory} options={CATEGORIES} allowClear size="sm" />
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">รูปแบบ</p>
              <ChipGroup value={format} onChange={setFormat} options={FORMATS} allowClear size="sm" />
            </div>
          </>
        ) : options.length === 0 ? (
          <p className="rounded-xl bg-subtle px-4 py-3 text-[13px] text-muted">ยังไม่มีคอนเทนต์ที่รอโพสต์ — ใช้แท็บ “คอนเทนต์ใหม่” ได้เลย</p>
        ) : (
          <Field label="คอนเทนต์">
            <Select value={contentId} onChange={setContentId} options={options} placeholder="— เลือกคอนเทนต์ —" ariaLabel="เลือกคอนเทนต์" />
          </Field>
        )}

        <div>
          <p className="mb-2 text-[13px] font-medium">ช่องทาง</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => {
              const on = platforms.includes(p.value);
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPlatforms((cur) => (on ? cur.filter((x) => x !== p.value) : [...cur, p.value]))}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-[13px] transition-colors",
                    on ? "border-primary bg-primary-soft text-ink" : "border-line text-muted hover:border-line-strong",
                  )}
                >
                  <PlatformMark platform={p.value} size="xs" /> {p.label}
                </button>
              );
            })}
          </div>
        </div>
        <Field label="เวลา" hint="ไม่บังคับ" className="max-w-[10rem]">
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
