"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import LibraryCard from "@/components/library/LibraryCard";
import { fetchAllSources } from "@/lib/supabase/queries";
import { createLearningSource } from "@/lib/supabase/mutations";
import { SOURCE_TYPE_LABEL, SOURCE_STATUS_LABEL } from "@/lib/learning-labels";
import type { LearningSource, SourceType, SourceStatus } from "@/lib/supabase/types";

const TYPE_FILTERS: { value: SourceType | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "book", label: SOURCE_TYPE_LABEL.book },
  { value: "podcast", label: SOURCE_TYPE_LABEL.podcast },
  { value: "audiobook", label: SOURCE_TYPE_LABEL.audiobook },
  { value: "video", label: SOURCE_TYPE_LABEL.video },
  { value: "article", label: SOURCE_TYPE_LABEL.article },
  { value: "course", label: SOURCE_TYPE_LABEL.course },
];

const STATUS_FILTERS: { value: SourceStatus | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "to_start", label: SOURCE_STATUS_LABEL.to_start },
  { value: "in_progress", label: SOURCE_STATUS_LABEL.in_progress },
  { value: "completed", label: SOURCE_STATUS_LABEL.completed },
];

export default function LibraryPage() {
  const [sources, setSources] = useState<LearningSource[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<SourceType>("book");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const data = await fetchAllSources();
      setSources(data);
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!sources) return [];
    const q = search.trim().toLowerCase();
    return sources.filter((s) => {
      if (typeFilter !== "all" && s.source_type !== typeFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !s.title.toLowerCase().includes(q) && !s.creator.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sources, search, typeFilter, statusFilter]);

  async function handleAdd() {
    if (!newTitle.trim()) {
      setAddError("กรอกชื่อก่อนนะ");
      return;
    }
    setAddBusy(true);
    setAddError(null);
    try {
      const created = await createLearningSource({ title: newTitle.trim(), source_type: newType });
      setSources((prev) => (prev ? [created, ...prev] : [created]));
      setNewTitle("");
      setAdding(false);
    } catch {
      setAddError("เพิ่มไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setAddBusy(false);
    }
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">คลังความรู้</h1>
          <p className="mt-1 text-muted">หนังสือ Podcast วิดีโอ และบทความทั้งหมดของคุณ</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="shrink-0 rounded-[10px] bg-primary px-4 py-2 text-sm text-white"
        >
          + เพิ่มแหล่งใหม่
        </button>
      </div>

      {adding ? (
        <Card className="p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm text-muted">ชื่อ</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted">ประเภท</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as SourceType)}
                className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-ink"
              >
                {TYPE_FILTERS.filter((t) => t.value !== "all").map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              disabled={addBusy}
              onClick={handleAdd}
              className="rounded-[10px] bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {addBusy ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </button>
          </div>
          {addError ? <p className="mt-2 text-xs text-accent">{addError}</p> : null}
        </Card>
      ) : null}

      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาจากชื่อหรือผู้เขียน..."
          className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTypeFilter(t.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                typeFilter === t.value ? "bg-primary text-white" : "bg-secondary text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStatusFilter(s.value)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                statusFilter === s.value ? "bg-ink text-white" : "border border-border text-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : sources === null ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState message="ไม่พบรายการที่ตรงกับตัวกรอง" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((source) => (
            <LibraryCard
              key={source.id}
              source={source}
              onUpdated={(updated) =>
                setSources((prev) => (prev ? prev.map((s) => (s.id === updated.id ? updated : s)) : prev))
              }
              onDeleted={(id) => setSources((prev) => (prev ? prev.filter((s) => s.id !== id) : prev))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
