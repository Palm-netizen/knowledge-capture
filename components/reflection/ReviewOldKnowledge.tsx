"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import SourceCover from "@/components/sources/SourceCover";
import NotePhotos, { HighlightList } from "@/components/notes/NotePhotos";
import { fetchRecentNotes, REVIEW_NOTE_LIMIT, type NoteWithSource } from "@/lib/supabase/queries";
import { splitHighlights } from "@/lib/highlights";
import { CAPTURE_KINDS, kindOf } from "@/lib/kinds";
import { formatThaiDate } from "@/lib/format";
import { randomIndex } from "@/lib/quotes";
import {
  DAILY_REVIEW_COUNT,
  REVIEW_PERIODS,
  dailyReviewSet,
  inPeriod,
  pastNotes,
  readReviewed,
  writeReviewed,
  type ReviewPeriodKey,
} from "@/lib/review";

type Tab = "today" | ReviewPeriodKey | "random";

function ReviewCard({
  note,
  daysAgo,
  reviewed,
  onToggle,
}: {
  note: NoteWithSource;
  daysAgo: number;
  reviewed: boolean;
  onToggle: () => void;
}) {
  const highlights = splitHighlights(note.highlight);
  const kind = note.source ? kindOf(note.source) : null;
  const kindLabel = CAPTURE_KINDS.find((k) => k.value === kind)?.label;

  return (
    <Card className={`p-5 transition-opacity ${reviewed ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {note.source ? (
          <SourceCover source={note.source} className="h-14 w-11 shrink-0 rounded-lg" initialClassName="text-base" />
        ) : null}
        <div className="min-w-0 flex-1">
          {note.source && note.source_id ? (
            <Link
              href={`/library/item?id=${note.source_id}`}
              className="block truncate font-medium text-ink hover:text-primary"
            >
              {note.source.title}
            </Link>
          ) : (
            <p className="font-medium text-ink">บันทึกส่วนตัว</p>
          )}
          <p className="mt-0.5 text-xs text-muted">
            {[kindLabel, formatThaiDate(note.captured_at, { short: true }), `${daysAgo} วันก่อน`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {note.learned ? <p className="whitespace-pre-line text-ink">{note.learned}</p> : null}
        <HighlightList items={highlights} />
        {note.thought ? <p className="text-sm text-muted">คิดว่า: {note.thought}</p> : null}
        {note.will_apply ? <p className="text-sm text-primary">จะนำไปใช้: {note.will_apply}</p> : null}
        <NotePhotos urls={note.image_urls} />
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={reviewed}
        className={`mt-4 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          reviewed ? "bg-good-tint text-good" : "bg-primary text-white hover:opacity-90"
        }`}
      >
        {reviewed ? "ทบทวนแล้ว ✓" : "ทบทวนแล้ว"}
      </button>
    </Card>
  );
}

export default function ReviewOldKnowledge() {
  const [notes, setNotes] = useState<NoteWithSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [randomPick, setRandomPick] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReviewed(readReviewed());
    fetchRecentNotes(REVIEW_NOTE_LIMIT)
      .then(setNotes)
      .catch(() => setError("โหลดบันทึกเก่าไม่สำเร็จ ลองใหม่อีกครั้ง"));
  }, []);

  const aged = useMemo(() => pastNotes(notes ?? []), [notes]);
  const todaySet = useMemo(() => dailyReviewSet(aged), [aged]);
  const doneToday = todaySet.filter((x) => reviewed.has(x.note.id)).length;

  function toggleReviewed(id: string) {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeReviewed(next);
      return next;
    });
  }

  function pickRandom() {
    setTab("random");
    setRandomPick((i) => randomIndex(aged.length, i));
  }

  const shown =
    tab === "today"
      ? todaySet
      : tab === "random"
        ? aged.length
          ? [aged[Math.min(randomPick, aged.length - 1)]]
          : []
        : aged.filter((x) => inPeriod(x.daysAgo, tab));

  const chipClass = (active: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-nav text-white" : "bg-panel text-ink hover:bg-secondary"
    }`;
  const countClass = (active: boolean, count: number) =>
    `rounded-full px-1.5 text-xs ${active ? "bg-white/20" : count ? "bg-accent-light text-primary" : "text-muted"}`;

  return (
    <section id="review" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-ink">ทบทวนความรู้เก่า</h2>
          <p className="mt-1 text-sm text-muted">
            วันละ {DAILY_REVIEW_COUNT} เรื่องจากบันทึกเก่า เปลี่ยนชุดใหม่ทุกวัน
          </p>
        </div>
        {todaySet.length ? (
          <span className="rounded-full bg-good-tint px-3 py-1 text-xs font-medium text-good">
            {doneToday >= todaySet.length ? "วันนี้ทบทวนครบแล้ว ✓" : `วันนี้ทบทวนแล้ว ${doneToday}/${todaySet.length}`}
          </span>
        ) : null}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : notes === null ? (
        <LoadingState />
      ) : aged.length === 0 ? (
        <EmptyState message="ยังไม่มีบันทึกเก่าให้ทบทวน เริ่มจดวันนี้ แล้วพรุ่งนี้จะมีเรื่องให้ทบทวน" />
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            <button type="button" onClick={() => setTab("today")} className={chipClass(tab === "today")}>
              วันนี้
              <span className={countClass(tab === "today", todaySet.length)}>{todaySet.length}</span>
            </button>
            {REVIEW_PERIODS.map((p) => {
              const count = aged.filter((x) => inPeriod(x.daysAgo, p.key)).length;
              return (
                <button key={p.key} type="button" onClick={() => setTab(p.key)} className={chipClass(tab === p.key)}>
                  {p.label}
                  <span className={countClass(tab === p.key, count)}>{count}</span>
                </button>
              );
            })}
            <button type="button" onClick={pickRandom} className={chipClass(tab === "random")}>
              สุ่ม ↻
            </button>
          </div>

          {shown.length === 0 ? (
            <EmptyState message="ช่วงนี้ไม่มีบันทึก ลองเลือกช่วงอื่น หรือกด “สุ่ม”" />
          ) : (
            <div className="space-y-3">
              {shown.map(({ note, daysAgo }) => (
                <ReviewCard
                  key={note.id}
                  note={note}
                  daysAgo={daysAgo}
                  reviewed={reviewed.has(note.id)}
                  onToggle={() => toggleReviewed(note.id)}
                />
              ))}
              {tab === "random" ? (
                <button type="button" onClick={pickRandom} className="text-sm font-medium text-primary hover:underline">
                  สุ่มเรื่องอื่น ↻
                </button>
              ) : null}
              {tab === "today" && doneToday >= todaySet.length ? (
                <p className="rounded-2xl bg-good-tint px-4 py-3 text-sm text-good">
                  ทบทวนครบ {todaySet.length} เรื่องแล้ววันนี้ พรุ่งนี้จะมีชุดใหม่ให้
                </p>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}
