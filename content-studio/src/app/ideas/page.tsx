"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Inbox, ListPlus, Plus, Search, X } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { useQuickActions } from "@/components/capture/QuickActions";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ChipGroup, Segmented, Select, TextInput } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaDialog } from "@/components/ideas/IdeaDialog";
import { InlineCapture } from "@/components/ideas/InlineCapture";
import { CATEGORIES, IDEA_KINDS, IDEA_STATUSES } from "@/lib/constants";
import type { Category, Idea, IdeaKind, IdeaStatus } from "@/lib/types";
import { isoToDateStr, parseDateStr, fmt, relativeDayLabel } from "@/lib/date";
import { matchesQuery } from "@/lib/utils";

type StatusFilter = "all" | IdeaStatus;

export default function IdeasPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IdeaInbox />
    </Suspense>
  );
}

function IdeaInbox() {
  const store = useStore();
  const { openCapture } = useQuickActions();
  const params = useSearchParams();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [kind, setKind] = useState<IdeaKind | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Idea | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const s = params.get("status");
    if (s && IDEA_STATUSES.some((x) => x.value === s)) setStatus(s as IdeaStatus);
  }, [params]);

  const base = useMemo(
    () =>
      store.ideas.filter(
        (i) =>
          (!kind || i.kind === kind) &&
          (!category || i.category === category) &&
          (!date || isoToDateStr(i.createdAt) === date) &&
          matchesQuery(query, i.title, i.details, i.sourceNote),
      ),
    [store.ideas, kind, category, date, query],
  );

  const filtered = status === "all" ? base : base.filter((i) => i.status === status);

  const groups = useMemo(() => {
    const map = new Map<string, Idea[]>();
    [...filtered]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .forEach((i) => {
        const d = isoToDateStr(i.createdAt);
        map.set(d, [...(map.get(d) ?? []), i]);
      });
    return [...map.entries()];
  }, [filtered]);

  if (!store.ready) return <PageSkeleton />;

  const hasFilters = !!(kind || category || date || query);
  const clearFilters = () => {
    setKind(null);
    setCategory(null);
    setDate("");
    setQuery("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Idea Inbox"
        description="สมุดบันทึกไอเดีย — จดก่อน คัดทีหลัง"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <ListPlus size={16} /> กรอกแบบละเอียด
            </Button>
            <Button variant="primary" onClick={() => openCapture()} className="hidden md:inline-flex">
              <Plus size={16} /> บันทึกไอเดีย
            </Button>
          </>
        }
      />

      <InlineCapture placeholder="คิดอะไรได้ พิมพ์ตรงนี้แล้วกด Enter…" />

      <div className="mt-6 space-y-3">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "ทั้งหมด", count: base.length },
            ...IDEA_STATUSES.map((s) => ({ value: s.value, label: s.label, count: base.filter((i) => i.status === s.value).length })),
          ]}
        />
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative md:w-64">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาไอเดีย" className="pl-9" aria-label="ค้นหาไอเดีย" />
          </div>
          <div className="grid grid-cols-2 gap-2 md:flex">
            <Select value={category} onChange={setCategory} options={CATEGORIES} placeholder="ทุกหมวดหมู่" ariaLabel="หมวดหมู่" className="md:w-40" />
            <div className="relative md:w-44">
              <CalendarDays size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="ดูตามวันที่" className="pl-9" />
            </div>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X size={14} /> ล้างตัวกรอง
            </Button>
          )}
        </div>
        <ChipGroup value={kind} onChange={setKind} options={IDEA_KINDS} allowClear size="sm" />
      </div>

      <div className="mt-6">
        {store.ideas.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Inbox ยังว่างอยู่"
            description="ไอเดียมักมาตอนทำสวน อ่านหนังสือ คุยกับคน หรือออกกำลังกาย — จดไว้ทันที แค่ประโยคเดียวก็พอ"
            action={
              <Button variant="primary" onClick={() => openCapture()}>
                <Plus size={16} /> บันทึกไอเดียแรก
              </Button>
            }
          />
        ) : groups.length === 0 ? (
          <EmptyState
            icon={Search}
            title="ไม่พบไอเดียที่ตรงกับตัวกรอง"
            description="ลองเปลี่ยนสถานะหรือล้างตัวกรอง"
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  clearFilters();
                  setStatus("all");
                }}
              >
                แสดงทั้งหมด
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {groups.map(([d, items]) => (
              <section key={d}>
                <h3 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-medium text-muted">
                  {relativeDayLabel(d)}
                  <span className="text-faint">· {fmt.weekday(parseDateStr(d))} · {items.length} ไอเดีย</span>
                </h3>
                <div className="space-y-2">
                  {items.map((i) => (
                    <IdeaCard key={i.id} idea={i} onEdit={setEditing} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <IdeaDialog open={!!editing || creating} idea={editing} onClose={() => { setEditing(null); setCreating(false); }} />
    </PageContainer>
  );
}
