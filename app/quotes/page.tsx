"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QuoteCard from "@/components/dashboard/QuoteCard";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { QuoteIcon } from "@/components/ui/icons";
import { fetchQuoteNotes, type QuoteNote } from "@/lib/supabase/queries";
import { updateLearningNote } from "@/lib/supabase/mutations";
import { joinHighlights, splitHighlights } from "@/lib/highlights";
import { CAPTURE_KINDS, kindOf, type CaptureKind } from "@/lib/kinds";
import { formatThaiDate } from "@/lib/format";
import { randomIndex } from "@/lib/quotes";

type KindFilter = "all" | CaptureKind | "other";

type QuoteItem = { key: string; index: number; text: string; note: QuoteNote; kind: CaptureKind | "other" };

export default function QuotesPage() {
  const [notes, setNotes] = useState<QuoteNote[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuoteNotes({ highlightsOnly: true })
      .then((data) => {
        setNotes(data);
        const count = data.reduce((n, note) => n + splitHighlights(note.highlight).length, 0);
        setFeaturedIndex(randomIndex(count));
      })
      .catch(() => setError("โหลดคลังคำพูดไม่สำเร็จ ลองใหม่อีกครั้ง"));
  }, []);

  const items = useMemo<QuoteItem[]>(
    () =>
      (notes ?? []).flatMap((note) =>
        splitHighlights(note.highlight).map((text, index) => ({
          key: `${note.id}:${index}`,
          index,
          text,
          note,
          kind: (note.source && kindOf(note.source)) || "other",
        }))
      ),
    [notes]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (q && !item.text.toLowerCase().includes(q) && !(item.note.source?.title ?? "").toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, search, kindFilter]);

  const filters: { value: KindFilter; label: string }[] = [
    { value: "all", label: "ทั้งหมด" },
    ...CAPTURE_KINDS.map((k) => ({ value: k.value as KindFilter, label: k.label })),
    ...(items.some((i) => i.kind === "other") ? [{ value: "other" as KindFilter, label: "อื่น ๆ" }] : []),
  ];

  async function handleCopy(item: QuoteItem) {
    const text = item.note.source?.title ? `“${item.text}” — ${item.note.source.title}` : `“${item.text}”`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(item.key);
      setTimeout(() => setCopiedKey((k) => (k === item.key ? null : k)), 1500);
    } catch {
      setActionError("คัดลอกไม่สำเร็จ");
    }
  }

  async function handleDelete(item: QuoteItem) {
    if (!window.confirm(`ลบคำพูดนี้ออกจากคลัง?\n\n“${item.text}”`)) return;
    setBusyKey(item.key);
    setActionError(null);
    try {
      const remaining = splitHighlights(item.note.highlight).filter((_, i) => i !== item.index);
      const highlight = joinHighlights(remaining);
      await updateLearningNote(item.note.id, { highlight });
      setNotes((prev) =>
        prev ? prev.map((n) => (n.id === item.note.id ? { ...n, highlight } : n)).filter((n) => n.highlight) : prev
      );
    } catch {
      setActionError("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="px-5 py-8 md:px-12 md:py-12 max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-4xl text-ink">คลังคำพูด</h1>
        <p className="mt-2 text-muted">
          ข้อความที่ประทับใจทั้งหมดจากการอ่านและการฟัง{items.length ? ` · ${items.length} ประโยค` : ""}
        </p>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : notes === null ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message='ยังไม่มีคำพูดในคลัง เพิ่ม "ข้อความที่ประทับใจ" ตอนจด Deep Note ที่หน้าบันทึก' />
      ) : (
        <>
          <QuoteCard
            key={items.length}
            quotes={items.map((i) => ({ text: i.text, sourceId: i.note.source_id, sourceTitle: i.note.source?.title ?? null }))}
            initialIndex={Math.min(featuredIndex, items.length - 1)}
          />

          <div className="space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาคำพูด หรือชื่อหนังสือ / ไฟล์..."
              className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
            />
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setKindFilter(f.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    kindFilter === f.value ? "bg-nav text-white" : "bg-panel text-ink hover:bg-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}

          {filtered.length === 0 ? (
            <EmptyState message="ไม่พบคำพูดที่ตรงกับการค้นหา" />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((item) => (
                <div key={item.key} className="flex flex-col rounded-[20px] bg-panel p-5">
                  <QuoteIcon className="h-6 w-6 text-accent" />
                  <p className="mt-2 flex-1 font-display text-lg leading-relaxed text-ink">{item.text}</p>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0 text-xs text-muted">
                      {item.note.source && item.note.source_id ? (
                        <Link
                          href={`/library/item?id=${item.note.source_id}`}
                          className="block truncate font-medium text-primary hover:underline"
                        >
                          {item.note.source.title}
                        </Link>
                      ) : null}
                      <span>{formatThaiDate(item.note.captured_at, { short: true })}</span>
                    </div>
                    <div className="flex shrink-0 gap-3 text-xs">
                      <button type="button" onClick={() => handleCopy(item)} className="font-medium text-primary hover:underline">
                        {copiedKey === item.key ? "คัดลอกแล้ว ✓" : "คัดลอก"}
                      </button>
                      <button
                        type="button"
                        disabled={busyKey === item.key}
                        onClick={() => handleDelete(item)}
                        className="text-danger hover:underline disabled:opacity-50"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
