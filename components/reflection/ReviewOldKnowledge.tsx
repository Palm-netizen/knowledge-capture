"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import SourceCover from "@/components/sources/SourceCover";
import NotePhotos, { HighlightList } from "@/components/notes/NotePhotos";
import { fetchRecentNotes, type NoteWithSource } from "@/lib/supabase/queries";
import { splitHighlights } from "@/lib/highlights";
import { CAPTURE_KINDS, kindOf } from "@/lib/kinds";
import { formatThaiDate } from "@/lib/format";
import { localDateIso } from "@/lib/stats";
import { randomIndex } from "@/lib/quotes";

// Each period is a small window of days rather than one exact day, so it
// still finds something when you don't log every single day.
const PERIODS = [
  { key: "1d", label: "เมื่อวาน", from: 1, to: 1 },
  { key: "1w", label: "1 สัปดาห์ก่อน", from: 6, to: 8 },
  { key: "1m", label: "1 เดือนก่อน", from: 27, to: 33 },
  { key: "3m", label: "3 เดือนก่อน", from: 85, to: 95 },
  { key: "1y", label: "1 ปีก่อน", from: 358, to: 372 },
] as const;

type PeriodKey = (typeof PERIODS)[number]["key"] | "random";

// Day number from local calendar fields, so "yesterday" follows the
// user's clock rather than UTC.
function dayNumber(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000;
}

const REVIEWED_PREFIX = "kc-reviewed-";

function readReviewed(todayKey: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVIEWED_PREFIX + todayKey) ?? "[]"));
  } catch {
    return new Set();
  }
}

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
  const [period, setPeriod] = useState<PeriodKey | null>(null);
  const [randomPick, setRandomPick] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const today = new Date();
  const todayKey = localDateIso(today);
  const todayNumber = dayNumber(today);

  useEffect(() => {
    setReviewed(readReviewed(localDateIso(new Date())));
    fetchRecentNotes(2000)
      .then(setNotes)
      .catch(() => setError("โหลดบันทึกเก่าไม่สำเร็จ ลองใหม่อีกครั้ง"));
  }, []);

  const pastNotes = useMemo(
    () =>
      (notes ?? [])
        .map((note) => ({ note, daysAgo: todayNumber - dayNumber(new Date(note.captured_at)) }))
        .filter((x) => x.daysAgo >= 1),
    [notes, todayNumber]
  );

  const byPeriod = useMemo(
    () =>
      Object.fromEntries(
        PERIODS.map((p) => [p.key, pastNotes.filter((x) => x.daysAgo >= p.from && x.daysAgo <= p.to)])
      ) as Record<(typeof PERIODS)[number]["key"], typeof pastNotes>,
    [pastNotes]
  );

  // Until the user picks a tab, open the nearest period that has notes.
  const activePeriod: PeriodKey =
    period ?? PERIODS.find((p) => byPeriod[p.key].length > 0)?.key ?? "random";

  function toggleReviewed(id: string) {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(REVIEWED_PREFIX + todayKey, JSON.stringify([...next]));
      } catch {
        // Storage unavailable — progress just won't survive a reload.
      }
      return next;
    });
  }

  function pickRandom() {
    setPeriod("random");
    setRandomPick((i) => randomIndex(pastNotes.length, i));
  }

  const shown =
    activePeriod === "random"
      ? pastNotes.length
        ? [pastNotes[Math.min(randomPick, pastNotes.length - 1)]]
        : []
      : byPeriod[activePeriod];

  const chipClass = (active: boolean) =>
    `flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-nav text-white" : "bg-panel text-ink hover:bg-secondary"
    }`;

  return (
    <section id="review" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-ink">ทบทวนความรู้เก่า</h2>
          <p className="mt-1 text-sm text-muted">อ่านซ้ำสิ่งที่เคยบันทึกไว้ ช่วยให้จำได้นานขึ้น</p>
        </div>
        {reviewed.size > 0 ? (
          <span className="rounded-full bg-good-tint px-3 py-1 text-xs font-medium text-good">
            วันนี้ทบทวนแล้ว {reviewed.size} เรื่อง
          </span>
        ) : null}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : notes === null ? (
        <LoadingState />
      ) : pastNotes.length === 0 ? (
        <EmptyState message="ยังไม่มีบันทึกเก่าให้ทบทวน เริ่มจดวันนี้ แล้วพรุ่งนี้จะมีเรื่องให้ทบทวน" />
      ) : (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {PERIODS.map((p) => {
              const count = byPeriod[p.key].length;
              const active = activePeriod === p.key;
              return (
                <button key={p.key} type="button" onClick={() => setPeriod(p.key)} className={chipClass(active)}>
                  {p.label}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      active ? "bg-white/20" : count ? "bg-accent-light text-primary" : "text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={pickRandom} className={chipClass(activePeriod === "random")}>
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
              {activePeriod === "random" ? (
                <button type="button" onClick={pickRandom} className="text-sm font-medium text-primary hover:underline">
                  สุ่มเรื่องอื่น ↻
                </button>
              ) : null}
            </div>
          )}
        </>
      )}
    </section>
  );
}
