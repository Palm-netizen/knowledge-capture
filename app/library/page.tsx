"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import SourceRow from "@/components/library/SourceRow";
import LibrarySummary from "@/components/library/LibrarySummary";
import DuplicateReview from "@/components/library/DuplicateReview";
import { findDuplicateGroups, groupKey } from "@/lib/duplicates";
import { fetchAllSources, fetchSessionStats } from "@/lib/supabase/queries";
import { createLearningSource, setSourcesCategory } from "@/lib/supabase/mutations";
import { SOURCE_TYPE_LABEL, SOURCE_STATUS_LABEL, collectCategories } from "@/lib/learning-labels";
import { sessionStatsBySource, type SessionStats } from "@/lib/stats";
import type { LearningSource, SourceType, SourceStatus } from "@/lib/supabase/types";

const ALL = "__all";
const NO_CATEGORY = "__none";
const CATEGORY_LIST_ID = "kc-library-categories";
const DISMISSED_KEY = "kc-dismissed-duplicates";

function readDismissed(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

const TYPE_FILTERS: { value: SourceType | "all"; label: string }[] = [
  { value: "all", label: "ทุกประเภท" },
  { value: "book", label: SOURCE_TYPE_LABEL.book },
  { value: "podcast", label: SOURCE_TYPE_LABEL.podcast },
  { value: "audiobook", label: SOURCE_TYPE_LABEL.audiobook },
  { value: "video", label: SOURCE_TYPE_LABEL.video },
  { value: "article", label: SOURCE_TYPE_LABEL.article },
  { value: "course", label: SOURCE_TYPE_LABEL.course },
];

const STATUS_FILTERS: { value: SourceStatus | "all"; label: string }[] = [
  { value: "all", label: "ทุกสถานะ" },
  { value: "to_start", label: SOURCE_STATUS_LABEL.to_start },
  { value: "in_progress", label: SOURCE_STATUS_LABEL.in_progress },
  { value: "completed", label: SOURCE_STATUS_LABEL.completed },
];

export default function LibraryPage() {
  const [sources, setSources] = useState<LearningSource[] | null>(null);
  const [statsById, setStatsById] = useState<Map<string, SessionStats>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [typeFilter, setTypeFilter] = useState<SourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SourceStatus | "all">("all");

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<SourceType>("book");
  const [newCategory, setNewCategory] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const [data, sessions] = await Promise.all([fetchAllSources(), fetchSessionStats()]);
      setSources(data);
      setStatsById(sessionStatsBySource(sessions));
    } catch {
      setError("โหลดข้อมูลไม่สำเร็จ ลองใหม่อีกครั้ง");
    }
  }

  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    load();
    setDismissed(readDismissed());
  }, []);

  function dismissGroup(key: string) {
    setDismissed((prev) => {
      const next = new Set(prev).add(key);
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {
        // Storage unavailable (private mode etc.) — dismissal just won't persist.
      }
      return next;
    });
  }

  const duplicateGroups = useMemo(
    () => findDuplicateGroups(sources ?? []).filter((g) => !dismissed.has(groupKey(g))),
    [sources, dismissed]
  );

  const categories = useMemo(() => collectCategories(sources ?? []), [sources]);
  const hasUncategorized = (sources ?? []).some((s) => !s.category);

  const filtered = useMemo(() => {
    if (!sources) return [];
    const q = search.trim().toLowerCase();
    return sources
      .filter((s) => {
        if (categoryFilter === NO_CATEGORY && s.category) return false;
        if (categoryFilter !== ALL && categoryFilter !== NO_CATEGORY && s.category !== categoryFilter) return false;
        if (typeFilter !== "all" && s.source_type !== typeFilter) return false;
        if (statusFilter !== "all" && s.status !== statusFilter) return false;
        if (q && !s.title.toLowerCase().includes(q) && !(s.creator ?? "").toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const la = statsById.get(a.id)?.lastAt ?? a.updated_at;
        const lb = statsById.get(b.id)?.lastAt ?? b.updated_at;
        return lb.localeCompare(la);
      });
  }, [sources, statsById, search, categoryFilter, typeFilter, statusFilter]);

  const summaryTitle =
    categoryFilter === NO_CATEGORY
      ? "ไม่มีหมวด"
      : categoryFilter !== ALL
        ? categoryFilter
        : typeFilter !== "all"
          ? SOURCE_TYPE_LABEL[typeFilter]
          : "ความรู้ทั้งหมด";

  async function handleAdd() {
    if (!newTitle.trim()) {
      setAddError("กรอกชื่อก่อนนะ");
      return;
    }
    setAddBusy(true);
    setAddError(null);
    try {
      const created = await createLearningSource({
        title: newTitle.trim(),
        source_type: newType,
        category: newCategory.trim(),
      });
      setSources((prev) => (prev ? [created, ...prev] : [created]));
      setNewTitle("");
      setAdding(false);
    } catch {
      setAddError("เพิ่มไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setAddBusy(false);
    }
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
    setBulkError(null);
  }

  async function handleBulkCategory() {
    const category = bulkCategory.trim();
    if (selectedIds.size === 0) {
      setBulkError("เลือกอย่างน้อย 1 รายการ");
      return;
    }
    setBulkBusy(true);
    setBulkError(null);
    try {
      const ids = [...selectedIds];
      await setSourcesCategory(ids, category);
      setSources((prev) => (prev ? prev.map((s) => (selectedIds.has(s.id) ? { ...s, category } : s)) : prev));
      exitSelectMode();
    } catch {
      setBulkError("ย้ายหมวดไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBulkBusy(false);
    }
  }

  const tabClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      active ? "bg-nav text-white" : "bg-panel text-ink hover:bg-secondary"
    }`;
  const chipClass = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs transition-colors ${
      active ? "bg-primary text-white" : "border border-border text-muted hover:text-ink"
    }`;

  return (
    <div className="px-5 py-8 md:px-12 md:py-12 max-w-5xl space-y-8">
      <datalist id={CATEGORY_LIST_ID}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">คลังความรู้</h1>
          <p className="mt-2 text-muted">หนังสือ Podcast วิดีโอ และบทความทั้งหมดของคุณ</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="shrink-0 rounded-full bg-nav px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + เพิ่มแหล่งใหม่
        </button>
      </div>

      {adding ? (
        <Card className="p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto] md:items-end">
            <div>
              <label className="text-sm text-muted">ชื่อ</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-sm text-muted">ประเภท</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as SourceType)}
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink"
              >
                {TYPE_FILTERS.filter((t) => t.value !== "all").map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted">หมวด</label>
              <input
                type="text"
                list={CATEGORY_LIST_ID}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="เช่น N21 Mobile"
                className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <button
              type="button"
              disabled={addBusy}
              onClick={handleAdd}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {addBusy ? "กำลังเพิ่ม..." : "เพิ่ม"}
            </button>
          </div>
          {addError ? <p className="mt-2 text-xs text-danger">{addError}</p> : null}
        </Card>
      ) : null}

      <DuplicateReview groups={duplicateGroups} statsById={statsById} onMerged={load} onDismiss={dismissGroup} />

      {/* หมวด */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <button type="button" onClick={() => setCategoryFilter(ALL)} className={tabClass(categoryFilter === ALL)}>
          ทุกหมวด
        </button>
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => setCategoryFilter(c)} className={tabClass(categoryFilter === c)}>
            {c}
          </button>
        ))}
        {hasUncategorized ? (
          <button
            type="button"
            onClick={() => setCategoryFilter(NO_CATEGORY)}
            className={tabClass(categoryFilter === NO_CATEGORY)}
          >
            ไม่มีหมวด
          </button>
        ) : null}
      </div>

      {sources ? <LibrarySummary title={summaryTitle} sources={filtered} statsById={statsById} /> : null}

      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาจากชื่อหรือผู้เขียน..."
          className="w-full rounded-full border border-border bg-card px-4 py-2.5 text-sm text-ink outline-none focus:border-primary"
        />
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((t) => (
            <button key={t.value} type="button" onClick={() => setTypeFilter(t.value)} className={chipClass(typeFilter === t.value)}>
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
              className={chipClass(statusFilter === s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sources && sources.length > 0 ? (
        selectMode ? (
          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">เลือกแล้ว {selectedIds.size} รายการ</p>
              <div className="flex gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set(filtered.map((s) => s.id)))}
                  className="text-primary hover:underline"
                >
                  เลือกทั้งหมดที่แสดง
                </button>
                <button type="button" onClick={exitSelectMode} className="text-muted hover:text-ink">
                  ยกเลิก
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                list={CATEGORY_LIST_ID}
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                placeholder="ชื่อหมวด เช่น N21 Mobile (เว้นว่าง = เอาออกจากหมวด)"
                className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm text-ink outline-none focus:border-primary"
              />
              <button
                type="button"
                disabled={bulkBusy}
                onClick={handleBulkCategory}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {bulkBusy ? "กำลังย้าย..." : "ย้ายเข้าหมวด"}
              </button>
            </div>
            {bulkError ? <p className="text-xs text-danger">{bulkError}</p> : null}
          </Card>
        ) : (
          <div className="flex justify-end">
            <button type="button" onClick={() => setSelectMode(true)} className="text-sm font-medium text-primary hover:underline">
              เลือกหลายรายการเพื่อจัดหมวด
            </button>
          </div>
        )
      ) : null}

      {error ? (
        <ErrorState message={error} />
      ) : sources === null ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState message="ไม่พบรายการที่ตรงกับตัวกรอง" />
      ) : (
        <Card className="p-2">
          {filtered.map((source) => (
            <SourceRow
              key={source.id}
              source={source}
              stats={statsById.get(source.id)}
              selectMode={selectMode}
              selected={selectedIds.has(source.id)}
              onToggle={() => toggleSelected(source.id)}
            />
          ))}
        </Card>
      )}
    </div>
  );
}
