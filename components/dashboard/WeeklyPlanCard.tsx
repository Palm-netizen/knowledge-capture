"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SourceCover from "@/components/sources/SourceCover";
import { N21_CATEGORY } from "@/lib/learning-labels";
import { clearWeeklyPlanSlot, createLearningSource, setWeeklyPlanSlot } from "@/lib/supabase/mutations";
import type { LearningSource } from "@/lib/supabase/types";

const POSITIONS = [1, 2, 3];

function SlotPicker({
  candidates,
  onPick,
  onCancel,
}: {
  candidates: LearningSource[];
  onPick: (source: LearningSource) => Promise<void>;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const q = query.trim();
  const matches = useMemo(
    () => candidates.filter((c) => !q || c.title.toLowerCase().includes(q.toLowerCase())).slice(0, 8),
    [candidates, q]
  );
  const exact = candidates.some((c) => c.title.trim().toLowerCase() === q.toLowerCase());

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setErr(null);
    try {
      await action();
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 rounded-2xl bg-card p-3">
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาไฟล์ N21 Mobile หรือพิมพ์หัวข้อใหม่..."
        className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-ink outline-none focus:border-primary"
      />
      <div className="max-h-56 overflow-y-auto">
        {matches.map((c) => (
          <button
            key={c.id}
            type="button"
            disabled={busy}
            onClick={() => run(() => onPick(c))}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-panel disabled:opacity-50"
          >
            <SourceCover source={c} className="h-9 w-7 shrink-0 rounded-md" initialClassName="text-xs" />
            <span className="truncate text-sm text-ink">{c.title}</span>
          </button>
        ))}
        {q && !exact ? (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(async () =>
                onPick(
                  await createLearningSource({
                    title: q,
                    source_type: "podcast",
                    category: N21_CATEGORY,
                    status: "to_start",
                  })
                )
              )
            }
            className="w-full rounded-xl px-2 py-2 text-left text-sm font-medium text-primary hover:bg-panel disabled:opacity-50"
          >
            + เพิ่ม &ldquo;{q}&rdquo; เป็นไฟล์ N21 Mobile ใหม่
          </button>
        ) : null}
        {!q && matches.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted">ยังไม่มีไฟล์ในหมวด N21 Mobile พิมพ์ชื่อหัวข้อเพื่อเพิ่มได้เลย</p>
        ) : null}
      </div>
      {err ? <p className="text-xs text-danger">{err}</p> : null}
      <button type="button" onClick={onCancel} className="text-xs text-muted hover:text-ink">
        ยกเลิก
      </button>
    </div>
  );
}

export default function WeeklyPlanCard({
  weekStartIso,
  slots,
  n21Sources,
  listenedThisWeek,
  unavailable,
  onChange,
}: {
  weekStartIso: string;
  slots: Map<number, LearningSource>;
  n21Sources: LearningSource[];
  listenedThisWeek: Set<string>;
  unavailable: boolean;
  onChange: (position: number, source: LearningSource | null) => void;
}) {
  const [picking, setPicking] = useState<number | null>(null);
  const [busyPosition, setBusyPosition] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const planned = [...slots.values()];
  const listened = planned.filter((s) => listenedThisWeek.has(s.id)).length;
  const plannedIds = new Set(planned.map((s) => s.id));

  async function handlePick(position: number, source: LearningSource) {
    await setWeeklyPlanSlot(weekStartIso, position, source.id);
    onChange(position, source);
    setPicking(null);
  }

  async function handleClear(position: number) {
    setBusyPosition(position);
    setErr(null);
    try {
      await clearWeeklyPlanSlot(weekStartIso, position);
      onChange(position, null);
    } catch {
      setErr("เอาออกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusyPosition(null);
    }
  }

  return (
    <div className="h-full rounded-[20px] bg-panel p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">N21 Mobile สัปดาห์นี้</h2>
          <p className="mt-1 text-sm text-muted">3 หัวข้อที่ตั้งใจเรียนรู้</p>
        </div>
        {planned.length ? (
          <span className="shrink-0 rounded-full bg-good-tint px-3 py-1 text-xs font-medium text-good">
            ฟังแล้ว {listened}/{planned.length}
          </span>
        ) : null}
      </div>

      {unavailable ? (
        <p className="mt-5 rounded-2xl bg-warn-tint px-4 py-3 text-sm text-warn">
          ต้องรัน SQL เพิ่มตาราง weekly_plan ใน Supabase ก่อน จึงจะใช้ส่วนนี้ได้
        </p>
      ) : (
        <ol className="mt-5 space-y-2">
          {POSITIONS.map((position) => {
            const source = slots.get(position);
            if (picking === position) {
              return (
                <li key={position}>
                  <SlotPicker
                    candidates={n21Sources.filter((s) => !plannedIds.has(s.id))}
                    onPick={(s) => handlePick(position, s)}
                    onCancel={() => setPicking(null)}
                  />
                </li>
              );
            }
            if (!source) {
              return (
                <li key={position}>
                  <button
                    type="button"
                    onClick={() => setPicking(position)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-border px-3 py-3 text-left text-sm text-muted transition-colors hover:border-primary hover:text-primary"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-xs font-semibold">
                      {position}
                    </span>
                    + เลือกหัวข้อที่ {position}
                  </button>
                </li>
              );
            }
            const done = listenedThisWeek.has(source.id);
            return (
              <li key={position} className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2.5">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    done ? "bg-good text-white" : "bg-secondary text-ink"
                  }`}
                >
                  {done ? "✓" : position}
                </span>
                <SourceCover source={source} className="h-10 w-8 shrink-0 rounded-md" initialClassName="text-xs" />
                <Link href={`/library/item?id=${source.id}`} className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink hover:text-primary">{source.title}</p>
                  <p className={`text-xs ${done ? "text-good" : "text-muted"}`}>{done ? "ฟังแล้วสัปดาห์นี้" : "ยังไม่ได้ฟัง"}</p>
                </Link>
                <button
                  type="button"
                  onClick={() => setPicking(position)}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  เปลี่ยน
                </button>
                <button
                  type="button"
                  disabled={busyPosition === position}
                  onClick={() => handleClear(position)}
                  aria-label={`เอาหัวข้อที่ ${position} ออก`}
                  className="shrink-0 px-1 text-sm text-muted hover:text-danger disabled:opacity-50"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ol>
      )}
      {err ? <p className="mt-2 text-xs text-danger">{err}</p> : null}
    </div>
  );
}
