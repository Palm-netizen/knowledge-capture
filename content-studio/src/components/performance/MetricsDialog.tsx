"use client";

import { useEffect, useState } from "react";
import { METRIC_FIELDS, platformMeta } from "@/lib/constants";
import type { Metrics, Publication } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, Field, TextInput } from "@/components/ui/Form";
import { useFeedback } from "@/components/ui/Feedback";
import { toDateStr, isoToDateStr } from "@/lib/date";
import { PostLink } from "@/components/ui/PostLink";

type Draft = Record<keyof Metrics, string>;

/** Record results after posting: numbers + "what I learned" + "what to improve". */
export function MetricsDialog({ pub, onClose }: { pub: Publication | null; onClose: () => void }) {
  const { updatePublication, contents } = useStore();
  const { toast } = useFeedback();
  const [draft, setDraft] = useState<Draft>({} as Draft);
  const [learnings, setLearnings] = useState("");
  const [improvements, setImprovements] = useState("");
  const [postedDate, setPostedDate] = useState("");
  const [postUrl, setPostUrl] = useState("");

  useEffect(() => {
    if (!pub) return;
    const d = {} as Draft;
    METRIC_FIELDS.forEach(({ key }) => (d[key] = pub[key] === null ? "" : String(pub[key])));
    setDraft(d);
    setLearnings(pub.learnings);
    setImprovements(pub.improvements);
    setPostUrl(pub.postUrl ?? "");
    setPostedDate(pub.publishedAt ? isoToDateStr(pub.publishedAt) : pub.scheduledDate ?? toDateStr(new Date()));
  }, [pub]);

  if (!pub) return null;
  const title = contents.find((c) => c.id === pub.contentId)?.title ?? "";

  const save = () => {
    const metrics = {} as Metrics;
    METRIC_FIELDS.forEach(({ key }) => {
      const raw = draft[key]?.replace(/[,\s]/g, "");
      const n = raw ? Number(raw) : NaN;
      metrics[key] = Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
    });
    updatePublication(pub.id, {
      ...metrics,
      learnings: learnings.trim(),
      improvements: improvements.trim(),
      postUrl: postUrl.trim(),
      status: "published",
      publishedAt: postedDate ? new Date(`${postedDate}T12:00:00`).toISOString() : pub.publishedAt,
    });
    toast("บันทึกผลลัพธ์แล้ว");
    onClose();
  };

  return (
    <Modal
      open={!!pub}
      onClose={onClose}
      title={`บันทึกผล · ${platformMeta(pub.platform).label}`}
      description={title}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save}>
            บันทึกผล
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <Field label="ลิงก์โพสต์" hint="เปิดดูยอดแล้วกลับมากรอก">
            <div className="flex items-center gap-1">
              <TextInput inputMode="url" value={postUrl} onChange={(e) => setPostUrl(e.target.value)} placeholder="https://www.facebook.com/…" />
              <PostLink url={postUrl} label="เปิดโพสต์" className="shrink-0" />
            </div>
          </Field>
          <Field label="วันที่โพสต์จริง">
            <TextInput type="date" value={postedDate} onChange={(e) => setPostedDate(e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {METRIC_FIELDS.map(({ key, label }) => (
            <Field key={key} label={label}>
              <TextInput
                inputMode="numeric"
                value={draft[key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value.replace(/[^\d,]/g, "") }))}
                placeholder="0"
                className="tabular-nums"
              />
            </Field>
          ))}
        </div>
        <Field label="สิ่งที่ได้เรียนรู้" hint="คอนเทนต์แบบไหนคนสนใจ?">
          <AutoTextarea value={learnings} onChange={(e) => setLearnings(e.target.value)} placeholder="เช่น Hook ที่ตั้งคำถามทำให้คนดูจนจบมากขึ้น" />
        </Field>
        <Field label="สิ่งที่จะปรับปรุง" hint="ครั้งหน้าจะทำอะไรให้ดีขึ้น?">
          <AutoTextarea value={improvements} onChange={(e) => setImprovements(e.target.value)} placeholder="เช่น ลองโพสต์ช่วงเย็น 19:00 น." />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
