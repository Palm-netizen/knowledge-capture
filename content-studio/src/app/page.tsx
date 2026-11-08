"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus, ChartColumn, Inbox, Lightbulb, PartyPopper, PenLine, Plus, Send, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { useQuickActions } from "@/components/capture/QuickActions";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, SectionTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PlatformMark } from "@/components/ui/Badge";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { IdeaDialog } from "@/components/ideas/IdeaDialog";
import { InlineCapture } from "@/components/ideas/InlineCapture";
import { ContentRow } from "@/components/studio/ContentRow";
import { PostItem } from "@/components/calendar/PostItem";
import { MetricsDialog } from "@/components/performance/MetricsDialog";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { WeeklySummary } from "@/components/overview/WeeklySummary";
import { PostLink } from "@/components/ui/PostLink";
import { NextPostCard } from "@/components/overview/NextPostCard";
import type { Idea, Publication } from "@/lib/types";
import { addDays, daysUntilNewYear, fmt, greeting, isoToDateStr, relativeDayLabel, toDateStr, todayStr } from "@/lib/date";
import { engagementRate, hasMetrics, sortBySchedule } from "@/lib/selectors";
import { cn, formatNumber } from "@/lib/utils";

export default function OverviewPage() {
  const store = useStore();
  const { openCapture, openNewContent } = useQuickActions();
  const [editing, setEditing] = useState<Idea | null>(null);
  const [metricsFor, setMetricsFor] = useState<Publication | null>(null);
  const [day, setDay] = useState(todayStr());

  const today = todayStr();
  const newIdeas = store.ideas.filter((i) => i.status === "new");
  const producing = store.contents.filter((c) => c.status === "producing" || c.status === "draft");
  const ready = store.contents.filter((c) => c.status === "ready");
  const todayPosts = store.publications.filter((p) => p.scheduledDate === today);
  const dayPosts = store.publications.filter((p) => p.scheduledDate === day).sort(sortBySchedule);

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => toDateStr(addDays(new Date(), i - 1))), []);
  const countByDay = (d: string) => store.publications.filter((p) => p.scheduledDate === d).length;

  const recent = store.publications
    .filter((p) => p.status === "published")
    .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
    .slice(0, 4);

  if (!store.ready) return <PageSkeleton />;

  const isEmpty = store.ideas.length === 0 && store.contents.length === 0;

  return (
    <PageContainer wide>
      <PageHeader
        title={`${greeting()}!`}
        description={`${fmt.long(new Date())} · วันนี้คุณมีอะไรอยากที่จะให้คนอื่น?`}
        actions={
          <>
            <Button variant="secondary" onClick={() => openNewContent()}>
              <PenLine size={16} /> สร้างคอนเทนต์
            </Button>
            <Button variant="primary" onClick={() => openCapture()}>
              <Plus size={16} /> บันทึกไอเดีย
            </Button>
          </>
        }
      >
        <NewYearNote />
      </PageHeader>

      {/* --- 4 key numbers: each one is a shortcut --- */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:mb-5 md:gap-4 lg:grid-cols-4">
        <StatTile href="/ideas?status=new" icon={Inbox} iconClass="bg-ink text-white" value={newIdeas.length} unit="ไอเดีย" label="ใหม่ รอคัดเลือก" />
        <StatTile href="/studio?status=producing" icon={PenLine} iconClass="bg-violet text-white" value={producing.length} unit="ชิ้น" label="กำลังผลิต" />
        <StatTile href="/studio?status=ready" icon={Send} iconClass="bg-primary text-white" value={ready.length} unit="ชิ้น" label="พร้อมโพสต์" />
        <StatTile href="/calendar" icon={CalendarPlus} iconClass="bg-orange-soft text-orange" value={todayPosts.length} unit="โพสต์" label={`วันนี้ · โพสต์แล้ว ${todayPosts.filter((p) => p.status === "published").length}`} />
      </div>

      {!isEmpty && (
        <div className="mb-8">
          <WeeklySummary />
        </div>
      )}

      {isEmpty ? (
        <Card className="p-6 md:p-10">
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Sparkles size={22} />
            </span>
            <h2 className="mt-4 text-lg font-semibold">เริ่มจากจดไอเดียแรกของคุณ</h2>
            <p className="mt-1.5 text-sm text-muted">
              เก็บทุกอย่างก่อนที่มันจะหายไป → เลือกไอเดียที่ชอบ → ทำเป็นคอนเทนต์หลัก → แตกเป็นเวอร์ชัน Facebook, Instagram, TikTok
            </p>
            <div className="mt-6 text-left">
              <InlineCapture placeholder="เช่น ฟัง Podcast วันนี้ได้แนวคิดว่า…" />
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-8">
            {/* --- schedule by day --- */}
            <section>
              <SectionTitle
                title="ตารางโพสต์"
                action={
                  <Link href="/calendar" className="flex items-center gap-1 text-[13px] text-muted hover:text-primary">
                    เปิดปฏิทิน <ArrowRight size={14} />
                  </Link>
                }
              />
              <Card className="p-3 md:p-4">
                <div className="scrollbar-none -mx-1 mb-3 flex gap-1 overflow-x-auto px-1">
                  {week.map((d) => {
                    const date = new Date(`${d}T00:00:00`);
                    const n = countByDay(d);
                    const active = d === day;
                    return (
                      <button
                        key={d}
                        onClick={() => setDay(d)}
                        className={cn(
                          "flex min-w-[3.25rem] flex-1 flex-col items-center rounded-lg py-2 text-xs transition-colors",
                          active ? "bg-primary text-white" : "text-muted hover:bg-subtle",
                        )}
                      >
                        <span>{d === today ? "วันนี้" : fmt.weekday(date)}</span>
                        <span className={cn("mt-0.5 text-base font-semibold", active ? "text-white" : "text-ink")}>{date.getDate()}</span>
                        <span className={cn("mt-1 h-1 w-1 rounded-full", n ? (active ? "bg-white" : "bg-primary") : "bg-transparent")} />
                      </button>
                    );
                  })}
                </div>
                {dayPosts.length === 0 ? (
                  <EmptyState
                    compact
                    icon={CalendarPlus}
                    title={day === today ? "วันนี้ยังไม่มีโพสต์" : `${relativeDayLabel(day)} ยังไม่มีโพสต์`}
                    description="วางแผนล่วงหน้าช่วยให้โพสต์สม่ำเสมอ"
                    action={
                      <Button size="sm" variant="secondary" onClick={() => openNewContent({ date: day })}>
                        <Plus size={14} /> {day === today ? "วางโพสต์วันนี้" : `วางโพสต์ ${relativeDayLabel(day)}`}
                      </Button>
                    }
                  />
                ) : (
                  <div className="divide-y divide-line">
                    {dayPosts.map((p) => (
                      <PostItem key={p.id} pub={p} />
                    ))}
                  </div>
                )}
              </Card>
            </section>

            {/* --- in production --- */}
            <section>
              <SectionTitle
                title="กำลังผลิต"
                count={producing.length}
                action={
                  <Link href="/studio?status=producing" className="flex items-center gap-1 text-[13px] text-muted hover:text-primary">
                    ดูทั้งหมด <ArrowRight size={14} />
                  </Link>
                }
              />
              {producing.length === 0 ? (
                <EmptyState
                  compact
                  icon={PenLine}
                  title="ยังไม่มีคอนเทนต์ที่กำลังทำ"
                  description="เลือกไอเดียที่ชอบแล้วกด “ทำคอนเทนต์” หรือเริ่มใหม่ได้เลย"
                  action={
                    <Button size="sm" variant="secondary" onClick={() => openNewContent()}>
                      <Plus size={14} /> สร้างคอนเทนต์
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-2">
                  {producing.slice(0, 5).map((c) => (
                    <ContentRow key={c.id} item={c} />
                  ))}
                </div>
              )}
            </section>

            {/* --- ready --- */}
            <section>
              <SectionTitle title="พร้อมโพสต์" count={ready.length} />
              {ready.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-line-strong px-4 py-5 text-center text-[13px] text-muted">
                  เมื่อเขียนคอนเทนต์เสร็จ เปลี่ยนสถานะเป็น “พร้อมโพสต์” แล้วจะแสดงที่นี่
                </p>
              ) : (
                <div className="space-y-2">
                  {ready.slice(0, 5).map((c) => (
                    <ContentRow key={c.id} item={c} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <NextPostCard />
            {/* --- new ideas --- */}
            <section>
              <SectionTitle
                title="ไอเดียใหม่"
                count={newIdeas.length}
                action={
                  <Link href="/ideas" className="flex items-center gap-1 text-[13px] text-muted hover:text-primary">
                    Idea Inbox <ArrowRight size={14} />
                  </Link>
                }
              />
              <div className="space-y-2">
                <InlineCapture />
                {newIdeas.length === 0 ? (
                  <p className="px-1 py-3 text-center text-[13px] text-muted">จัดการไอเดียครบแล้ว 👍</p>
                ) : (
                  newIdeas.slice(0, 5).map((i) => <IdeaCard key={i.id} idea={i} onEdit={setEditing} compact />)
                )}
                {newIdeas.length > 5 && (
                  <Link href="/ideas?status=new" className="block py-1 text-center text-[13px] text-muted hover:text-primary">
                    อีก {newIdeas.length - 5} ไอเดีย
                  </Link>
                )}
              </div>
            </section>

            {/* --- latest performance --- */}
            <section>
              <SectionTitle
                title="ผลงานล่าสุด"
                action={
                  <Link href="/performance" className="flex items-center gap-1 text-[13px] text-muted hover:text-primary">
                    Performance <ArrowRight size={14} />
                  </Link>
                }
              />
              {recent.length === 0 ? (
                <EmptyState compact icon={ChartColumn} title="ยังไม่มีโพสต์ที่เผยแพร่" description="กด “โพสต์แล้ว” ในตารางโพสต์ แล้วกลับมาบันทึกยอดที่นี่" />
              ) : (
                <Card className="divide-y divide-line">
                  {recent.map((p) => {
                    const c = store.contents.find((x) => x.id === p.contentId);
                    const er = engagementRate(p);
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-3.5">
                        <PlatformMark platform={p.platform} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{c?.title}</p>
                          <p className="text-xs text-muted">
                            {p.publishedAt ? relativeDayLabel(isoToDateStr(p.publishedAt)) : ""}
                            {hasMetrics(p) && ` · เข้าถึง ${formatNumber(p.reach)}${er !== null ? ` · มีส่วนร่วม ${(er * 100).toFixed(1)}%` : ""}`}
                          </p>
                        </div>
                        <PostLink url={p.postUrl} />
                        <Button size="sm" variant={hasMetrics(p) ? "ghost" : "secondary"} onClick={() => setMetricsFor(p)}>
                          {hasMetrics(p) ? "แก้ไขผล" : "บันทึกผล"}
                        </Button>
                      </div>
                    );
                  })}
                </Card>
              )}
            </section>

            <ButtonLink href="/ideas" variant="ghost" className="w-full">
              <Lightbulb size={15} /> ทบทวนไอเดียทั้งหมด
            </ButtonLink>
          </div>
        </div>
      )}

      <IdeaDialog open={!!editing} idea={editing} onClose={() => setEditing(null)} />
      <MetricsDialog pub={metricsFor} onClose={() => setMetricsFor(null)} />
    </PageContainer>
  );
}

function StatTile({
  href,
  icon: Icon,
  iconClass,
  value,
  unit,
  label,
}: {
  href: string;
  icon: typeof Inbox;
  iconClass: string;
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <Link href={href} className="group rounded-3xl bg-card p-5 shadow-card transition-shadow hover:shadow-pop md:p-6">
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl transition-transform group-hover:scale-105", iconClass)}>
        <Icon size={20} />
      </span>
      <p className="mt-6 font-display text-[38px] leading-none font-semibold tracking-tight tabular-nums md:text-[44px]">
        {value}
        <span className="ml-1.5 text-base font-medium text-ink/80">{unit}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </Link>
  );
}

/** Countdown to the new year + a reflection question (Overview header). */
function NewYearNote() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(daysUntilNewYear()), []);
  if (days === null) return null;
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3.5 py-1.5 text-[13px] text-white">
        <PartyPopper size={14} className="text-orange" />
        {days === 0 ? (
          "สวัสดีปีใหม่ ปาล์ม! 🎉"
        ) : (
          <span>
            นับถอยหลัง <span className="font-display font-semibold tabular-nums">{days}</span> วัน จะปีใหม่แล้ว ปาล์ม
          </span>
        )}
      </span>
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-soft px-3.5 py-1.5 text-[13px] text-ink">
        <span className="font-display font-semibold text-violet">Q.</span>
        จริงๆ แล้วคนแบบไหน ที่คุณอยากเป็น?
      </span>
    </div>
  );
}
