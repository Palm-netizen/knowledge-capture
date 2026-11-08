"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import SourceCard from "@/components/sources/SourceCard";
import QuoteCard from "@/components/dashboard/QuoteCard";
import FocusCard, { BookIcon, HeadphonesIcon } from "@/components/dashboard/FocusCard";
import WeeklyGoalCard from "@/components/dashboard/WeeklyGoalCard";
import WeeklyPlanCard from "@/components/dashboard/WeeklyPlanCard";
import {
  fetchAllSources,
  fetchSessionStats,
  fetchPendingActions,
  fetchLatestReflection,
  fetchGoal,
  fetchWeeklyPlan,
  fetchQuoteNotes,
} from "@/lib/supabase/queries";
import { upsertGoal } from "@/lib/supabase/mutations";
import type { LearningSource, LearningNote, ActionItem, Reflection, WeeklyPlanSlot } from "@/lib/supabase/types";
import { N21_CATEGORY } from "@/lib/learning-labels";
import { formatThaiDate, greetingForNow } from "@/lib/format";
import { localDateIso, sessionStatsBySource, startOfWeek } from "@/lib/stats";
import { buildQuotePool, randomIndex, type Quote } from "@/lib/quotes";

type Session = Pick<LearningNote, "source_id" | "captured_at" | "duration_minutes">;

type DashboardData = {
  sources: LearningSource[];
  sessions: Session[];
  pendingActions: ActionItem[];
  weeklyReflection: Reflection | null;
  weekGoal: number | null;
  plan: WeeklyPlanSlot[] | null; // null = weekly_plan table not available yet
  quotes: Quote[];
  quoteIndex: number;
};

const wrap = "px-5 py-8 md:px-12 md:py-12 max-w-6xl";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const weekStart = startOfWeek();
  const weekStartIso = localDateIso(weekStart);

  useEffect(() => {
    let active = true;
    const weekIso = localDateIso(startOfWeek());

    async function load() {
      try {
        const [sources, sessions, pendingActions, weeklyReflection, goal, quoteNotes] = await Promise.all([
          fetchAllSources(),
          fetchSessionStats(),
          fetchPendingActions(4),
          fetchLatestReflection("weekly"),
          fetchGoal("sources", weekIso),
          fetchQuoteNotes(),
        ]);
        // Separate so the rest of the page still works before the
        // weekly_plan table has been created.
        let plan: WeeklyPlanSlot[] | null = null;
        try {
          plan = await fetchWeeklyPlan(weekIso);
        } catch {
          plan = null;
        }
        if (!active) return;
        const quotes = buildQuotePool(quoteNotes);
        setData({
          sources,
          sessions,
          pendingActions,
          weeklyReflection,
          weekGoal: goal?.target_value ?? null,
          plan,
          quotes,
          quoteIndex: randomIndex(quotes.length),
        });
      } catch {
        if (active) setError("โหลดข้อมูลไม่สำเร็จ ตรวจสอบการเชื่อมต่อ Supabase แล้วลองใหม่อีกครั้ง");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <div className={wrap}>
        <ErrorState message={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={wrap}>
        <LoadingState />
      </div>
    );
  }

  const statsById = sessionStatsBySource(data.sessions);
  const sessionsThisWeek = data.sessions.filter((s) => new Date(s.captured_at) >= weekStart);
  const engaged = (s: LearningSource) => (statsById.get(s.id)?.count ?? 0) > 0 || s.status === "completed";
  const countSessions = (list: LearningSource[]) => list.reduce((n, s) => n + (statsById.get(s.id)?.count ?? 0), 0);

  const n21 = data.sources.filter((s) => s.category === N21_CATEGORY);
  const n21Ids = new Set(n21.map((s) => s.id));
  const n21WeekSessions = sessionsThisWeek.filter((s) => s.source_id && n21Ids.has(s.source_id));
  const listenedThisWeek = new Set(n21WeekSessions.map((s) => s.source_id as string));

  const books = data.sources.filter((s) => s.source_type === "book" && s.category !== N21_CATEGORY);
  const bookIds = new Set(books.map((s) => s.id));
  const bookWeekSessions = sessionsThisWeek.filter((s) => s.source_id && bookIds.has(s.source_id)).length;

  const sourceById = new Map(data.sources.map((s) => [s.id, s]));
  const slots = new Map<number, LearningSource>();
  (data.plan ?? []).forEach((p) => {
    const s = sourceById.get(p.source_id);
    if (s) slots.set(p.position, s);
  });

  const currentlyReading = data.sources
    .filter((s) => s.status === "in_progress")
    .sort((a, b) => (statsById.get(b.id)?.lastAt ?? b.updated_at).localeCompare(statsById.get(a.id)?.lastAt ?? a.updated_at))
    .slice(0, 8);

  async function saveWeekGoal(target: number) {
    await upsertGoal("sources", weekStartIso, target);
    setData((prev) => (prev ? { ...prev, weekGoal: target } : prev));
  }

  function handlePlanChange(position: number, source: LearningSource | null) {
    setData((prev) => {
      if (!prev) return prev;
      const plan = (prev.plan ?? []).filter((p) => p.position !== position);
      if (source) plan.push({ position, source_id: source.id });
      const sources = source && !prev.sources.some((s) => s.id === source.id) ? [source, ...prev.sources] : prev.sources;
      return { ...prev, plan, sources };
    });
  }

  return (
    <div className={`${wrap} space-y-10`}>
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{formatThaiDate(new Date().toISOString())}</p>
          <h1 className="font-display text-4xl text-ink mt-1">{greetingForNow()}</h1>
          <p className="mt-2 text-muted">วันนี้มีอะไรให้บันทึกบ้าง?</p>
        </div>
        <Link
          href="/capture"
          className="rounded-full bg-nav px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + บันทึกใหม่
        </Link>
      </div>

      <QuoteCard quotes={data.quotes} initialIndex={data.quoteIndex} />

      {/* Focus: N21 Mobile + Books */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FocusCard
          title={N21_CATEGORY}
          icon={<HeadphonesIcon />}
          href={`/library?category=${encodeURIComponent(N21_CATEGORY)}`}
          stats={[
            { label: "ไฟล์ทั้งหมด", value: n21.length },
            { label: "ครั้งที่ฟัง", value: countSessions(n21) },
          ]}
          footnote={`ฟังแล้ว ${n21.filter(engaged).length} ไฟล์ · สัปดาห์นี้ฟัง ${n21WeekSessions.length} ครั้ง`}
        />
        <FocusCard
          title="หนังสือ"
          icon={<BookIcon />}
          href="/library?type=book"
          stats={[
            { label: "เล่มที่อ่าน", value: books.filter(engaged).length },
            { label: "ครั้งที่อ่าน", value: countSessions(books) },
          ]}
          footnote={`อ่านจบ ${books.filter((b) => b.status === "completed").length} เล่ม · สัปดาห์นี้อ่าน ${bookWeekSessions} ครั้ง`}
        />
      </section>

      {/* Weekly goal + weekly N21 plan */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <WeeklyGoalCard goal={data.weekGoal} done={listenedThisWeek.size} onSave={saveWeekGoal} />
        </div>
        <div className="lg:col-span-3">
          <WeeklyPlanCard
            weekStartIso={weekStartIso}
            slots={slots}
            n21Sources={n21}
            listenedThisWeek={listenedThisWeek}
            unavailable={data.plan === null}
            onChange={handlePlanChange}
          />
        </div>
      </section>

      {/* Currently learning */}
      <section>
        <SectionHeading
          title="กำลังเรียนอยู่"
          action={
            <Link href="/library" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        {currentlyReading.length === 0 ? (
          <EmptyState message="ยังไม่มีสิ่งที่กำลังเรียนอยู่ ไปเพิ่มในคลังความรู้กันเถอะ" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {currentlyReading.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </section>

      {/* Weekly reflection */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">ทบทวนประจำสัปดาห์</h2>
          <Link href="/reflection" className="text-sm font-medium text-primary hover:underline">
            เขียนรีเฟลกชันใหม่ →
          </Link>
        </div>
        {data.weeklyReflection ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              สัปดาห์ของ {formatThaiDate(data.weeklyReflection.period_start, { short: true })}
            </p>
            {data.weeklyReflection.reflection_text ? (
              <p className="text-lg text-ink">&ldquo;{data.weeklyReflection.reflection_text}&rdquo;</p>
            ) : null}
            {data.weeklyReflection.key_lessons ? (
              <p className="text-sm text-muted">{data.weeklyReflection.key_lessons}</p>
            ) : null}
          </div>
        ) : (
          <EmptyState message="ยังไม่มีรีเฟลกชันประจำสัปดาห์ ลองเขียนสรุปสัปดาห์นี้ดูสิ" />
        )}
        {data.pendingActions.length > 0 ? (
          <div className="mt-6 rounded-2xl bg-card p-4">
            <p className="text-xs font-medium text-muted mb-2">สิ่งที่ยังต้องตามต่อ</p>
            <ul className="space-y-2">
              {data.pendingActions.map((action) => (
                <li key={action.id} className="text-sm text-ink flex items-start gap-2">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  {action.action_text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
