"use client";

import { useState } from "react";
import SourceCover from "@/components/sources/SourceCover";
import { SOURCE_TYPE_LABEL, sessionVerb } from "@/lib/learning-labels";
import { mergeSources } from "@/lib/supabase/mutations";
import { groupKey } from "@/lib/duplicates";
import type { SessionStats } from "@/lib/stats";
import type { LearningSource } from "@/lib/supabase/types";

function defaultKeep(group: LearningSource[], statsById: Map<string, SessionStats>): string {
  return [...group].sort(
    (a, b) =>
      (statsById.get(b.id)?.count ?? 0) - (statsById.get(a.id)?.count ?? 0) ||
      Number(!!b.cover_url) - Number(!!a.cover_url) ||
      a.created_at.localeCompare(b.created_at)
  )[0].id;
}

function DuplicateGroup({
  group,
  statsById,
  onMerged,
  onDismiss,
}: {
  group: LearningSource[];
  statsById: Map<string, SessionStats>;
  onMerged: () => void;
  onDismiss: () => void;
}) {
  const [keepId, setKeepId] = useState(() => defaultKeep(group, statsById));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleMerge() {
    const keep = group.find((s) => s.id === keepId);
    if (!keep) return;
    setBusy(true);
    setErr(null);
    try {
      await mergeSources(
        keep,
        group.filter((s) => s.id !== keepId)
      );
      onMerged();
    } catch {
      setErr("รวมไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl bg-card p-3">
      <p className="px-1 pb-2 text-xs text-muted">เลือกชื่อที่จะเก็บไว้ บันทึกทั้งหมดจะถูกย้ายมารวมที่รายการนี้</p>
      <div className="space-y-1">
        {group.map((s) => {
          const count = statsById.get(s.id)?.count ?? 0;
          return (
            <label
              key={s.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 ${
                keepId === s.id ? "bg-accent-light" : "hover:bg-panel"
              }`}
            >
              <input
                type="radio"
                name={`keep-${groupKey(group)}`}
                checked={keepId === s.id}
                onChange={() => setKeepId(s.id)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              <SourceCover source={s} className="h-12 w-9 shrink-0 rounded-md" initialClassName="text-sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{s.title}</p>
                <p className="text-xs text-muted">
                  {SOURCE_TYPE_LABEL[s.source_type]} · {count ? `${sessionVerb(s.source_type)} ${count} ครั้ง` : "ยังไม่มีบันทึก"}
                </p>
              </div>
            </label>
          );
        })}
      </div>
      {err ? <p className="px-1 pt-2 text-xs text-danger">{err}</p> : null}
      <div className="flex flex-wrap items-center gap-3 px-1 pt-3">
        <button
          type="button"
          disabled={busy}
          onClick={handleMerge}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy ? "กำลังรวม..." : `รวม ${group.length} รายการเป็นรายการเดียว`}
        </button>
        <button type="button" disabled={busy} onClick={onDismiss} className="text-sm text-muted hover:text-ink">
          ไม่ใช่รายการซ้ำ
        </button>
      </div>
    </div>
  );
}

export default function DuplicateReview({
  groups,
  statsById,
  onMerged,
  onDismiss,
}: {
  groups: LearningSource[][];
  statsById: Map<string, SessionStats>;
  onMerged: () => void;
  onDismiss: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (groups.length === 0) return null;

  return (
    <div className="rounded-[20px] border border-accent/40 bg-accent-light/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink">
          พบรายการที่อาจซ้ำกัน <span className="font-semibold">{groups.length} กลุ่ม</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white"
        >
          {open ? "ซ่อน" : "ตรวจสอบและรวม"}
        </button>
      </div>
      {open ? (
        <div className="mt-4 space-y-3">
          {groups.map((g) => (
            <DuplicateGroup
              key={groupKey(g)}
              group={g}
              statsById={statsById}
              onMerged={onMerged}
              onDismiss={() => onDismiss(groupKey(g))}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
