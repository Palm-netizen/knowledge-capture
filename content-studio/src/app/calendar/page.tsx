"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { ChipGroup, Segmented } from "@/components/ui/Form";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlatformMark } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { PostChip } from "@/components/calendar/PostChip";
import { PostItem } from "@/components/calendar/PostItem";
import { ScheduleDialog } from "@/components/calendar/ScheduleDialog";
import { PostDialog } from "@/components/calendar/PostDialog";
import { PLATFORMS, platformMeta } from "@/lib/constants";
import type { Platform, Publication } from "@/lib/types";
import { addDays, fmt, parseDateStr, relativeDayLabel, startOfWeek, toDateStr, todayStr } from "@/lib/date";
import { sortBySchedule } from "@/lib/selectors";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { studioHref } from "@/lib/routes";
import { useFeedback } from "@/components/ui/Feedback";
import { DRAG_TYPE, isPostDrag, startPostDrag } from "@/components/calendar/dnd";

type View = "week" | "month";
const WEEKDAYS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

export default function CalendarPage() {
  const store = useStore();
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(todayStr());
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [scheduleFor, setScheduleFor] = useState<string | null>(null);
  const [openPost, setOpenPost] = useState<string | null>(null);

  const today = todayStr();
  const { toast } = useFeedback();
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const movePost = (pubId: string, ds: string) => {
    const pub = store.publications.find((p) => p.id === pubId);
    if (!pub || pub.status === "published" || pub.scheduledDate === ds) return;
    const prev = pub.scheduledDate;
    store.updatePublication(pubId, { scheduledDate: ds });
    toast(`ย้ายไป${relativeDayLabel(ds) === "วันนี้" ? "วันนี้" : ` ${fmt.short(parseDateStr(ds))}`} แล้ว`, {
      action: { label: "เลิกทำ", onClick: () => store.updatePublication(pubId, { scheduledDate: prev }) },
    });
  };

  /** Props that make a day cell accept dropped posts. */
  const dropZone = (ds: string) => ({
    "data-day": ds,
    onDragOver: (e: React.DragEvent) => {
      if (!isPostDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dropTarget !== ds) setDropTarget(ds);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) setDropTarget((t) => (t === ds ? null : t));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDropTarget(null);
      const id = e.dataTransfer.getData(DRAG_TYPE);
      if (id) movePost(id, ds);
    },
  });

  const byDay = useMemo(() => {
    const map = new Map<string, Publication[]>();
    store.publications
      .filter((p) => p.scheduledDate && (!platform || p.platform === platform))
      .sort(sortBySchedule)
      .forEach((p) => map.set(p.scheduledDate!, [...(map.get(p.scheduledDate!) ?? []), p]));
    return map;
  }, [store.publications, platform]);

  const unscheduled = store.publications.filter((p) => !p.scheduledDate && p.status !== "published" && (!platform || p.platform === platform));

  const days = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = startOfWeek(first);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const total = Math.ceil(((last.getTime() - start.getTime()) / 86400000 + 1) / 7) * 7;
    return Array.from({ length: total }, (_, i) => addDays(start, i));
  }, [view, cursor]);

  if (!store.ready) return <PageSkeleton />;

  const move = (dir: -1 | 1) => {
    const d = new Date(cursor);
    if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir, 1);
    setCursor(d);
  };

  const rangeLabel =
    view === "month"
      ? fmt.month(cursor)
      : `${fmt.short(days[0])} – ${fmt.short(days[6])} ${days[6].getFullYear() + 543}`;

  const selectedPosts = byDay.get(selected) ?? [];
  const periodPosts = days.reduce((n, d) => n + (byDay.get(toDateStr(d))?.length ?? 0), 0);

  return (
    <PageContainer full>
      <PageHeader
        title="Content Calendar"
        description="แต่ละวันจะลงอะไร ลงช่องทางไหน"
        actions={
          <Button variant="primary" onClick={() => setScheduleFor(selected)}>
            <Plus size={16} /> วางแผนคอนเทนต์
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="secondary" onClick={() => move(-1)} aria-label="ก่อนหน้า">
            <ChevronLeft size={17} />
          </Button>
          <Button size="icon" variant="secondary" onClick={() => move(1)} aria-label="ถัดไป">
            <ChevronRight size={17} />
          </Button>
          <Button
            size="md"
            variant="ghost"
            onClick={() => {
              setCursor(new Date());
              setSelected(today);
            }}
          >
            วันนี้
          </Button>
          <h2 className="ml-1 text-[15px] font-semibold">{rangeLabel}</h2>
          <span className="text-xs text-faint">· {periodPosts} โพสต์</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ChipGroup
            value={platform}
            onChange={setPlatform}
            options={PLATFORMS.map((p) => ({ value: p.value, label: p.label }))}
            allowClear
            size="sm"
          />
          <Segmented<View>
            value={view}
            onChange={setView}
            options={[
              { value: "week", label: "สัปดาห์" },
              { value: "month", label: "เดือน" },
            ]}
            className="mx-0 px-0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          {view === "week" ? (
            <>
              {/* desktop: 7 columns */}
              <div className="hidden grid-cols-7 overflow-hidden rounded-2xl border border-line bg-line md:grid md:gap-px">
                {days.map((d) => {
                  const ds = toDateStr(d);
                  const posts = byDay.get(ds) ?? [];
                  return (
                    <div key={ds} {...dropZone(ds)} className={cn("group flex min-h-[26rem] flex-col bg-card transition-colors", ds === today && "bg-primary-soft/40", dropTarget === ds && "bg-primary-soft ring-2 ring-primary ring-inset")}>
                      <button
                        onClick={() => setSelected(ds)}
                        title="เลือกวันนี้"
                        className={cn("flex items-center justify-between px-2.5 pt-2.5 pb-2 text-left", selected === ds && "bg-subtle")}
                      >
                        <span className="text-xs text-muted">{fmt.weekday(d)}</span>
                        <span
                          className={cn(
                            "flex h-6 min-w-6 items-center justify-center rounded-full text-[13px] font-semibold",
                            ds === today ? "bg-primary text-white" : "text-ink",
                          )}
                        >
                          {d.getDate()}
                        </span>
                      </button>
                      <div
                        className="flex flex-1 cursor-pointer flex-col gap-1 px-2 pb-2"
                        onClick={() => {
                          setSelected(ds);
                          setScheduleFor(ds);
                        }}
                        title="คลิกเพื่อวางแผนคอนเทนต์วันนี้"
                      >
                        {posts.map((p) => (
                          <PostChip key={p.id} pub={p} onOpen={setOpenPost} />
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(ds);
                            setScheduleFor(ds);
                          }}
                          className="mt-auto flex h-8 items-center justify-center gap-1 rounded-lg text-xs text-faint opacity-60 transition-opacity group-hover:bg-subtle group-hover:text-primary group-hover:opacity-100 focus:opacity-100"
                          aria-label={`วางแผนวันที่ ${d.getDate()}`}
                        >
                          <Plus size={14} /> วางแผน
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 hidden text-xs text-faint md:block">คลิกช่องว่างของวันเพื่อวางแผนคอนเทนต์ · คลิกโพสต์เพื่อแก้ไข/ลบ · ลากโพสต์ไปวันอื่นเพื่อเปลี่ยนวัน</p>
              {/* mobile: agenda */}
              <div className="space-y-3 md:hidden">
                {days.map((d) => {
                  const ds = toDateStr(d);
                  const posts = byDay.get(ds) ?? [];
                  return (
                    <Card key={ds} className={cn("p-3", ds === today && "border-primary/40")}>
                      <div className="mb-1 flex items-center justify-between px-2">
                        <p className="text-sm font-medium">
                          {fmt.weekday(d)} {d.getDate()}
                          {ds === today && <span className="ml-2 text-xs font-normal text-primary">วันนี้</span>}
                        </p>
                        <button onClick={() => setScheduleFor(ds)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-subtle" aria-label="วางโพสต์">
                          <Plus size={16} />
                        </button>
                      </div>
                      {posts.length === 0 ? (
                        <p className="px-2 pb-1 text-xs text-faint">ว่าง</p>
                      ) : (
                        <div className="divide-y divide-line">
                          {posts.map((p) => (
                            <PostItem key={p.id} pub={p} />
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="overflow-hidden rounded-2xl border border-line bg-line">
                <div className="grid grid-cols-7 gap-px">
                  {WEEKDAYS.map((w) => (
                    <div key={w} className="bg-subtle py-2.5 text-center text-xs font-medium text-muted">
                      {w}
                    </div>
                  ))}
                  {days.map((d) => {
                    const ds = toDateStr(d);
                    const posts = byDay.get(ds) ?? [];
                    const inMonth = d.getMonth() === cursor.getMonth();
                    return (
                      <div
                        key={ds}
                        {...dropZone(ds)}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelected(ds);
                          // desktop: plan right away; mobile: select and show the day below
                          if (window.matchMedia("(min-width: 768px)").matches) setScheduleFor(ds);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setSelected(ds);
                            setScheduleFor(ds);
                          }
                        }}
                        title="คลิกเพื่อวางแผนคอนเทนต์วันนี้"
                        className={cn(
                          "group flex min-h-16 cursor-pointer flex-col gap-1 bg-card p-1 text-left transition-colors hover:bg-subtle/60 md:min-h-32 md:p-1.5 xl:min-h-36",
                          dropTarget === ds && "bg-primary-soft",
                          !inMonth && "bg-bg",
                          selected === ds && "ring-2 ring-primary ring-inset",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center self-end rounded-full text-xs md:self-start",
                            ds === today ? "bg-primary font-semibold text-white" : inMonth ? "text-ink" : "text-faint",
                          )}
                        >
                          {d.getDate()}
                        </span>
                        {/* mobile: dots */}
                        <div className="flex flex-wrap gap-0.5 md:hidden">
                          {posts.slice(0, 6).map((p) => (
                            <span key={p.id} className={cn("h-1.5 w-1.5 rounded-full", platformMeta(p.platform).dot, p.status === "published" && "opacity-40")} />
                          ))}
                        </div>
                        {/* desktop: chips */}
                        <div className="hidden flex-col gap-1 md:flex">
                          {posts.slice(0, 4).map((p) => (
                            <PostChip key={p.id} pub={p} compact onOpen={setOpenPost} />
                          ))}
                          {posts.length > 4 && <span className="px-1 text-[11px] text-muted">+{posts.length - 4} โพสต์</span>}
                          <span className="mt-0.5 hidden items-center gap-1 px-1 text-[11px] text-primary group-hover:flex">
                            <Plus size={12} /> วางแผน
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <p className="mt-2 hidden text-xs text-faint md:block">คลิกวันเพื่อวางแผนคอนเทนต์ · คลิกโพสต์เพื่อแก้ไข/ลบ · ลากโพสต์ไปวันอื่นเพื่อเปลี่ยนวัน</p>

              <Card className="mt-4 p-3 md:p-4">
                <SectionTitle
                  title={`${relativeDayLabel(selected)} · ${fmt.weekday(parseDateStr(selected))}`}
                  count={selectedPosts.length}
                  className="px-2"
                  action={
                    <Button size="sm" onClick={() => setScheduleFor(selected)}>
                      <Plus size={14} /> วางแผน
                    </Button>
                  }
                />
                {selectedPosts.length === 0 ? (
                  <p className="px-2 pb-2 text-[13px] text-muted">ยังไม่มีโพสต์ในวันนี้</p>
                ) : (
                  <div className="divide-y divide-line">
                    {selectedPosts.map((p) => (
                      <PostItem key={p.id} pub={p} />
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <Card className="p-4">
            <SectionTitle title="ยังไม่กำหนดวัน" count={unscheduled.length} />
            {unscheduled.length === 0 ? (
              <EmptyState compact icon={CalendarClock} title="ทุกเวอร์ชันมีวันโพสต์แล้ว" />
            ) : (
              <div className="space-y-1">
                {unscheduled.map((p) => {
                  const c = store.contents.find((x) => x.id === p.contentId);
                  return (
                    <div key={p.id} draggable onDragStart={(e) => startPostDrag(e, p.id)} className="flex cursor-grab items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-subtle/70 active:cursor-grabbing" title="ลากไปวางในปฏิทินเพื่อกำหนดวัน">
                      <PlatformMark platform={p.platform} size="xs" />
                      <Link href={studioHref(p.contentId, p.platform)} className="min-w-0 flex-1 truncate text-[13px] hover:text-primary">
                        {c?.title}
                      </Link>
                      <button
                        onClick={() => store.updatePublication(p.id, { scheduledDate: selected })}
                        className="shrink-0 rounded-md border border-line px-2 py-1 text-[11px] text-muted hover:border-primary hover:text-primary"
                        title={`ตั้งเป็นวันที่ ${fmt.short(parseDateStr(selected))}`}
                      >
                        ลง {relativeDayLabel(selected)}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <div className="flex flex-wrap gap-3 px-1 text-xs text-muted">
            {PLATFORMS.map((p) => (
              <span key={p.value} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", p.dot)} /> {p.label}
              </span>
            ))}
          </div>
        </aside>
      </div>

      <ScheduleDialog date={scheduleFor} onClose={() => setScheduleFor(null)} />
      <PostDialog pubId={openPost} onClose={() => setOpenPost(null)} />
    </PageContainer>
  );
}
