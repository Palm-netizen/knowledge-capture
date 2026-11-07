"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import Pill from "@/components/ui/Pill";
import StatTile from "@/components/ui/StatTile";
import EmptyState from "@/components/ui/EmptyState";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import SourceCard from "@/components/sources/SourceCard";
import MonthlyGoalCard from "@/components/dashboard/MonthlyGoalCard";
import {
  fetchSourcesByStatus,
  fetchRecentNotes,
  fetchNoteStats,
  fetchPendingActions,
  fetchLatestReflection,
  fetchSourceCounts,
  fetchMonthlyHoursGoal,
  type NoteWithSource,
} from "@/lib/supabase/queries";
import type { LearningSource, ActionItem, Reflection } from "@/lib/supabase/types";
import { NOTE_LEVEL_LABEL } from "@/lib/learning-labels";
import { formatHours, formatThaiDate, greetingForNow, timeAgoThai } from "@/lib/format";
import { computeStreakDays, minutesInMonth, startOfMonthIso, sumMinutes } from "@/lib/stats";

type DashboardData = {
  currentlyReading: LearningSource[];
  recentlyCompleted: LearningSource[];
  recentNotes: NoteWithSource[];
  pendingActions: ActionItem[];
  weeklyReflection: Reflection | null;
  totalHoursMinutes: number;
  monthHoursMinutes: number;
  monthGoalHours: number | null;
  streakDays: number;
  sourceCounts: { total: number; completed: number };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const monthIso = startOfMonthIso();
        const [
          currentlyReading,
          recentlyCompleted,
          recentNotes,
          noteStats,
          pendingActions,
          weeklyReflection,
          sourceCounts,
          monthGoal,
        ] = await Promise.all([
          fetchSourcesByStatus("in_progress", 6),
          fetchSourcesByStatus("completed", 6),
          fetchRecentNotes(6),
          fetchNoteStats(),
          fetchPendingActions(4),
          fetchLatestReflection("weekly"),
          fetchSourceCounts(),
          fetchMonthlyHoursGoal(monthIso),
        ]);

        if (!active) return;

        setData({
          currentlyReading,
          recentlyCompleted,
          recentNotes,
          pendingActions,
          weeklyReflection,
          totalHoursMinutes: sumMinutes(noteStats),
          monthHoursMinutes: minutesInMonth(noteStats, new Date()),
          monthGoalHours: monthGoal?.target_value ?? null,
          streakDays: computeStreakDays(noteStats.map((n) => n.captured_at)),
          sourceCounts,
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
      <div className="px-5 py-8 md:px-12 md:py-12 max-w-6xl">
        <ErrorState message={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="px-5 py-8 md:px-12 md:py-12 max-w-6xl">
        <LoadingState />
      </div>
    );
  }

  const today = formatThaiDate(new Date().toISOString());

  return (
    <div className="px-5 py-8 md:px-12 md:py-12 max-w-6xl space-y-12">
      {/* Welcome Message */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{today}</p>
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

      {/* Learning Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="ชั่วโมงเรียนรู้ทั้งหมด" value={`${formatHours(data.totalHoursMinutes)} ชม.`} />
        <StatTile
          label="เรียนจบแล้ว"
          value={`${data.sourceCounts.completed}/${data.sourceCounts.total}`}
          sublabel="เล่ม/รายการ"
        />
        <StatTile label="ต่อเนื่อง" value={`${data.streakDays} วัน`} sublabel="บันทึกติดต่อกัน" />
      </section>

      {/* Monthly goal + Weekly Reflection */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <MonthlyGoalCard
            goalHours={data.monthGoalHours}
            monthMinutes={data.monthHoursMinutes}
            onGoalSaved={(target) => setData((prev) => (prev ? { ...prev, monthGoalHours: target } : prev))}
          />
        </div>
        <Card className="p-6 lg:col-span-3">
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
      </section>

      {/* Currently Reading */}
      <section>
        <SectionHeading
          title="กำลังเรียนอยู่"
          action={
            <Link href="/library" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        {data.currentlyReading.length === 0 ? (
          <EmptyState message="ยังไม่มีสิ่งที่กำลังเรียนอยู่ ไปเพิ่มในคลังความรู้กันเถอะ" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.currentlyReading.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Learned */}
      <section>
        <SectionHeading title="เรียนรู้ล่าสุด" />
        {data.recentlyCompleted.length === 0 ? (
          <EmptyState message="ยังไม่มีสิ่งที่เรียนจบ เมื่อจบเล่มแรกจะมาโชว์ที่นี่" />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.recentlyCompleted.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Notes */}
      <section>
        <SectionHeading
          title="บันทึกล่าสุด"
          action={
            <Link href="/capture" className="text-sm text-primary hover:underline">
              ดูทั้งหมด
            </Link>
          }
        />
        {data.recentNotes.length === 0 ? (
          <EmptyState message="ยังไม่มีบันทึก เริ่มจดสิ่งที่เรียนรู้ได้ที่หน้า Capture" />
        ) : (
          <div className="space-y-3">
            {data.recentNotes.map((note) => (
              <Link key={note.id} href="/capture" className="block">
                <Card className="p-5 transition-colors hover:bg-secondary">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-ink line-clamp-2">
                        {note.learned || note.highlight || "(ยังไม่มีรายละเอียด)"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {note.source?.title ?? "ไม่ได้ผูกกับแหล่งข้อมูล"} · {timeAgoThai(note.captured_at)}
                      </p>
                    </div>
                    <Pill tone={note.note_level === "deep" ? "accent" : "neutral"}>
                      {NOTE_LEVEL_LABEL[note.note_level]}
                    </Pill>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
