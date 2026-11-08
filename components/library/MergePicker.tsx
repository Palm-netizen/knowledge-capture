"use client";

import { useMemo, useState } from "react";
import SourceCover from "@/components/sources/SourceCover";
import { SOURCE_TYPE_LABEL } from "@/lib/learning-labels";
import { DUPLICATE_THRESHOLD, titleSimilarity } from "@/lib/duplicates";
import { mergeSources } from "@/lib/supabase/mutations";
import type { LearningSource } from "@/lib/supabase/types";

export default function MergePicker({
  source,
  candidates,
  onMerged,
}: {
  source: LearningSource;
  candidates: LearningSource[];
  onMerged: (merged: LearningSource, mergedIds: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ranked = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates
      .filter((c) => c.id !== source.id && (!q || c.title.toLowerCase().includes(q)))
      .map((c) => ({ source: c, score: titleSimilarity(source.title, c.title) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);
  }, [candidates, source, query]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleMerge() {
    const others = candidates.filter((c) => picked.has(c.id));
    if (others.length === 0) return;
    if (!window.confirm(`รวม ${others.length} รายการเข้ากับ "${source.title}"? บันทึกทั้งหมดจะถูกย้ายมาที่นี่`)) return;
    setBusy(true);
    setErr(null);
    try {
      onMerged(await mergeSources(source, others), others.map((o) => o.id));
    } catch {
      setErr("รวมไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <p className="text-sm font-medium text-ink">รวมรายการอื่นเข้ามาที่นี่</p>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="ค้นหาชื่อ..."
        className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-ink outline-none focus:border-primary"
      />
      <div className="max-h-72 space-y-1 overflow-y-auto">
        {ranked.map(({ source: c, score }) => (
          <label
            key={c.id}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 ${
              picked.has(c.id) ? "bg-accent-light" : "hover:bg-card"
            }`}
          >
            <input
              type="checkbox"
              checked={picked.has(c.id)}
              onChange={() => toggle(c.id)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            <SourceCover source={c} className="h-10 w-8 shrink-0 rounded-md" initialClassName="text-xs" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-ink">{c.title}</p>
              <p className="text-xs text-muted">{SOURCE_TYPE_LABEL[c.source_type]}</p>
            </div>
            {score >= DUPLICATE_THRESHOLD ? (
              <span className="shrink-0 rounded-full bg-warn-tint px-2 py-0.5 text-[11px] font-medium text-warn">อาจซ้ำ</span>
            ) : null}
          </label>
        ))}
        {ranked.length === 0 ? <p className="py-4 text-center text-sm text-muted">ไม่พบรายการ</p> : null}
      </div>
      {err ? <p className="text-xs text-danger">{err}</p> : null}
      <button
        type="button"
        disabled={busy || picked.size === 0}
        onClick={handleMerge}
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {busy ? "กำลังรวม..." : `รวม ${picked.size} รายการเข้ารายการนี้`}
      </button>
    </div>
  );
}
