"use client";

import { useEffect, useMemo, useState } from "react";
import { PenLine } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import type { Platform } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select, TextInput } from "@/components/ui/Form";
import { PlatformMark } from "@/components/ui/Badge";
import { useFeedback } from "@/components/ui/Feedback";
import { useQuickActions } from "@/components/capture/QuickActions";
import { fmt, parseDateStr } from "@/lib/date";
import { cn } from "@/lib/utils";

/** Put an existing content on a day: pick content + platforms + time. */
export function ScheduleDialog({ date, onClose }: { date: string | null; onClose: () => void }) {
  const store = useStore();
  const { toast } = useFeedback();
  const { openNewContent } = useQuickActions();
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
    setContentId(null);
    setPlatforms(["facebook", "instagram", "tiktok"]);
    setTime("");
  }, [date]);

  if (!date) return null;

  const save = () => {
    if (!contentId || platforms.length === 0) return;
    platforms.forEach((p) => {
      const existing = store.publications.find((x) => x.contentId === contentId && x.platform === p);
      if (existing) store.updatePublication(existing.id, { scheduledDate: date, scheduledTime: time || existing.scheduledTime });
      else store.addPublication(contentId, p, { scheduledDate: date, scheduledTime: time || null });
    });
    toast(`วางโพสต์วันที่ ${fmt.short(parseDateStr(date))} แล้ว`);
    onClose();
  };

  return (
    <Modal
      open={!!date}
      onClose={onClose}
      title="วางโพสต์"
      description={fmt.long(parseDateStr(date))}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save} disabled={!contentId || platforms.length === 0}>
            วางโพสต์
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {options.length === 0 ? (
          <p className="rounded-lg bg-subtle px-4 py-3 text-[13px] text-muted">ยังไม่มีคอนเทนต์ที่รอโพสต์ — สร้างคอนเทนต์ใหม่สำหรับวันนี้ได้เลย</p>
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
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] transition-colors",
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
        <button
          type="button"
          onClick={() => {
            onClose();
            openNewContent({ date });
          }}
          className="flex items-center gap-1.5 text-[13px] text-primary hover:underline"
        >
          <PenLine size={14} /> หรือสร้างคอนเทนต์ใหม่สำหรับวันนี้
        </button>
      </div>
    </Modal>
  );
}
