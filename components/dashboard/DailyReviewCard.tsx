"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { splitHighlights } from "@/lib/highlights";
import { DAILY_REVIEW_COUNT, readReviewed, type AgedNote } from "@/lib/review";
import type { QuoteNote } from "@/lib/supabase/queries";

export default function DailyReviewCard({ items }: { items: AgedNote<QuoteNote>[] }) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReviewed(readReviewed());
  }, []);

  const done = items.filter((x) => reviewed.has(x.note.id)).length;
  const allDone = items.length > 0 && done >= items.length;

  return (
    <div className="rounded-[20px] bg-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">ทบทวนวันนี้</h2>
          <p className="mt-1 text-sm text-muted">
            {DAILY_REVIEW_COUNT} เรื่องจากบันทึกเก่า · เปลี่ยนชุดใหม่ทุกวัน
          </p>
        </div>
        {items.length ? (
          <span className="shrink-0 rounded-full bg-good-tint px-3 py-1 text-xs font-medium text-good">
            {allDone ? "ครบแล้ว ✓" : `ทบทวนแล้ว ${done}/${items.length}`}
          </span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted">ยังไม่มีบันทึกเก่าให้ทบทวน — จดวันนี้ แล้วพรุ่งนี้จะมีเรื่องให้ทบทวน</p>
      ) : (
        <>
          <ol className="mt-5 space-y-2">
            {items.map(({ note, daysAgo }, i) => {
              const isDone = reviewed.has(note.id);
              const preview = note.learned || splitHighlights(note.highlight)[0] || note.thought || "";
              return (
                <li key={note.id}>
                  <Link
                    href="/reflection#review"
                    className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isDone ? "bg-good text-white" : "bg-secondary text-ink"
                      }`}
                    >
                      {isDone ? "✓" : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm ${isDone ? "text-muted line-through" : "text-ink"}`}>{preview}</p>
                      <p className="truncate text-xs text-muted">
                        {note.source?.title ?? "บันทึกส่วนตัว"} · {daysAgo} วันก่อน
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            href="/reflection#review"
            className="mt-5 block rounded-full bg-linear-to-r from-primary to-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {allDone ? "ดูอีกครั้ง →" : "เริ่มทบทวน →"}
          </Link>
        </>
      )}
    </div>
  );
}
