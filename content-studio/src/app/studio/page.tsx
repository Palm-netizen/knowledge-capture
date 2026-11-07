"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, PenLine, Plus, Search, X } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { useQuickActions } from "@/components/capture/QuickActions";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Segmented, Select, TextInput } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { ContentRow } from "@/components/studio/ContentRow";
import { CONTENT_STATUSES, PLATFORMS } from "@/lib/constants";
import type { ContentItem, ContentStatus, Platform } from "@/lib/types";
import { pubsOf } from "@/lib/selectors";
import { matchesQuery } from "@/lib/utils";

type StatusFilter = "all" | ContentStatus;
type Sort = "updated" | "schedule" | "created";

export default function StudioPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StudioList />
    </Suspense>
  );
}

function StudioList() {
  const store = useStore();
  const { openNewContent } = useQuickActions();
  const params = useSearchParams();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [date, setDate] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("updated");

  useEffect(() => {
    const s = params.get("status");
    if (s && CONTENT_STATUSES.some((x) => x.value === s)) setStatus(s as ContentStatus);
  }, [params]);

  const nextDate = (c: ContentItem) => pubsOf(store, c.id).map((p) => p.scheduledDate).filter(Boolean).sort()[0] ?? "9999";

  const base = useMemo(
    () =>
      store.contents
        .filter((c) => {
          const pubs = store.publications.filter((p) => p.contentId === c.id);
          if (platform && !pubs.some((p) => p.platform === platform)) return false;
          if (date && !pubs.some((p) => p.scheduledDate === date)) return false;
          return matchesQuery(query, c.title, c.hook, c.mainMessage, c.caption);
        })
        .sort((a, b) =>
          sort === "updated"
            ? b.updatedAt.localeCompare(a.updatedAt)
            : sort === "created"
              ? b.createdAt.localeCompare(a.createdAt)
              : nextDate(a).localeCompare(nextDate(b)),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.contents, store.publications, platform, date, query, sort],
  );

  if (!store.ready) return <PageSkeleton />;

  const hasFilters = !!(platform || date || query);
  const visibleStatuses = status === "all" ? CONTENT_STATUSES : CONTENT_STATUSES.filter((s) => s.value === status);

  return (
    <PageContainer>
      <PageHeader
        title="Content Studio"
        description="หนึ่งไอเดีย → หนึ่งคอนเทนต์หลัก → หลายเวอร์ชันตามแพลตฟอร์ม"
        actions={
          <Button variant="primary" onClick={() => openNewContent()}>
            <Plus size={16} /> สร้างคอนเทนต์
          </Button>
        }
      />

      <div className="space-y-3">
        <Segmented
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "ทั้งหมด", count: base.length },
            ...CONTENT_STATUSES.map((s) => ({ value: s.value, label: s.label, count: base.filter((c) => c.status === s.value).length })),
          ]}
        />
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="relative md:w-64">
            <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint" />
            <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาคอนเทนต์" className="pl-9" aria-label="ค้นหาคอนเทนต์" />
          </div>
          <div className="grid grid-cols-3 gap-2 md:flex">
            <Select value={platform} onChange={setPlatform} options={PLATFORMS} placeholder="ทุกช่องทาง" ariaLabel="แพลตฟอร์ม" className="md:w-36" />
            <div className="relative md:w-44">
              <CalendarDays size={15} className="pointer-events-none absolute top-1/2 left-3 hidden -translate-y-1/2 text-faint md:block" />
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="วันโพสต์" title="ดูคอนเทนต์ที่โพสต์ในวันที่" className="md:pl-9" />
            </div>
            <Select<Sort>
              value={sort}
              onChange={(v) => setSort(v ?? "updated")}
              options={[
                { value: "updated", label: "แก้ไขล่าสุด" },
                { value: "schedule", label: "วันโพสต์ใกล้สุด" },
                { value: "created", label: "สร้างล่าสุด" },
              ]}
              ariaLabel="เรียงตาม"
              className="md:w-40"
            />
          </div>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPlatform(null);
                setDate("");
                setQuery("");
              }}
            >
              <X size={14} /> ล้างตัวกรอง
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        {store.contents.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="ยังไม่มีคอนเทนต์"
            description="เริ่มจากไอเดียใน Inbox หรือสร้างคอนเทนต์ใหม่ แล้วเขียน Hook, เรื่องเล่า และ Caption ในที่เดียว"
            action={
              <Button variant="primary" onClick={() => openNewContent()}>
                <Plus size={16} /> สร้างคอนเทนต์แรก
              </Button>
            }
          />
        ) : (
          <div className="space-y-8">
            {visibleStatuses.map((s) => {
              const items = base.filter((c) => c.status === s.value);
              if (status === "all" && items.length === 0) return null;
              return (
                <section key={s.value}>
                  {status === "all" && (
                    <h3 className="mb-2 flex items-center gap-2 px-1 text-[13px] font-medium text-muted">
                      {s.label} <span className="text-faint">· {items.length}</span>
                    </h3>
                  )}
                  {items.length === 0 ? (
                    <EmptyState compact icon={PenLine} title={`ไม่มีคอนเทนต์ “${s.label}”`} description={hasFilters ? "ลองล้างตัวกรอง" : undefined} />
                  ) : (
                    <div className="space-y-2">
                      {items.map((c) => (
                        <ContentRow key={c.id} item={c} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
            {status === "all" && base.length === 0 && (
              <EmptyState icon={Search} title="ไม่พบคอนเทนต์ที่ตรงกับตัวกรอง" />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
