"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import StatTile from "@/components/ui/StatTile";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ConsistencyHeatmap from "@/components/growth/ConsistencyHeatmap";
import TopicBars from "@/components/growth/TopicBars";
import MonthlyHoursChart from "@/components/growth/MonthlyHoursChart";
import {
  fetchNotesForGrowth,
  fetchSourceCounts,
  fetchLatestAnyReflection,
  fetchMonthlyHoursGoal,
} from "@/lib/supabase/queries";
import { formatHours } from "@/lib/format";
import {
  buildHeatmapWeeks,
  computeStreakDays,
  monthlyHoursTrend,
  startOfMonthIso,
  sumMinutes,
  topicBreakdown,
  type HeatmapCell,
} from "@/lib/stats";
import type { Reflection } from "@/lib/supabase/types";

type GrowthData = {
  totalHoursMinutes: number;
  totalNotes: number;
  streakDays: number;
  sourcesCompleted: number;
  heatmapWeeks: HeatmapCell[][];
  topics: { tag: string; count: number; pct: number }[];
  monthlyTrend: { label: string; minutes: number }[];
  goalHours: number | null;
  latestReflection: Reflection | null;
};

export default function GrowthPage() {
  const [data, setData] = useState<GrowthData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [notes, sourceCounts, latestReflection, monthGoal] = await Promise.all([
          fetchNotesForGrowth(),
          fetchSourceCounts(),
          fetchLatestAnyReflection(),
          fetchMonthlyHoursGoal(startOfMonthIso()),
        ]);

        if (!active) return;

        setData({
          totalHoursMinutes: sumMinutes(notes),
          totalNotes: notes.length,
          streakDays: computeStreakDays(notes.map((n) => n.captured_at)),
          sourcesCompleted: sourceCounts.completed,
          heatmapWeeks: buildHeatmapWeeks(notes.map((n) => n.captured_at)),
          topics: topicBreakdown(notes),
          monthlyTrend: monthlyHoursTrend(notes),
          goalHours: monthGoal?.target_value ?? null,
          latestReflection,
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

  return (
    <div className="px-5 py-8 md:px-12 md:py-12 max-w-6xl space-y-10">
      <div>
        <h1 className="font-display text-4xl text-ink">เติบโต</h1>
        <p className="mt-1 text-muted">เทียบกับตัวเองเมื่อก่อน ไม่ใช่แข่งกับใคร</p>
      </div>

      <section>
        <SectionHeading title="สถิติการเรียนรู้" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="ชั่วโมงเรียนรู้ทั้งหมด" value={`${formatHours(data.totalHoursMinutes)} ชม.`} />
          <StatTile label="บันทึกทั้งหมด" value={`${data.totalNotes}`} sublabel="รายการ" />
          <StatTile label="ต่อเนื่อง" value={`${data.streakDays} วัน`} sublabel="บันทึกติดต่อกัน" />
          <StatTile label="เรียนจบแล้ว" value={`${data.sourcesCompleted}`} sublabel="เล่ม/รายการ" />
        </div>
      </section>

      <section>
        <SectionHeading title="ความสม่ำเสมอ" />
        <Card className="p-5">
          <ConsistencyHeatmap weeksGrid={data.heatmapWeeks} />
          <p className="mt-3 text-xs text-muted">12 สัปดาห์ที่ผ่านมา — สีเข้มขึ้นเมื่อบันทึกมากขึ้นในวันนั้น</p>
        </Card>
      </section>

      <section>
        <SectionHeading title="ชั่วโมงเรียนรู้รายเดือน" />
        <Card className="p-5">
          <MonthlyHoursChart data={data.monthlyTrend} goalHours={data.goalHours} />
        </Card>
      </section>

      <section>
        <SectionHeading title="หัวข้อที่เรียนรู้บ่อย" />
        <Card className="p-5">
          {data.topics.length === 0 ? (
            <EmptyState message="ยังไม่มีแท็กให้สรุป ลองใส่แท็กตอนจด Deep Note" />
          ) : (
            <TopicBars items={data.topics} />
          )}
        </Card>
      </section>

      <section>
        <SectionHeading title="การเปลี่ยนแปลงในชีวิตจริง" />
        <Card className="bg-linear-to-br from-hero-from via-hero-via to-hero-to p-6">
          {data.latestReflection?.reflection_text ? (
            <p className="text-lg text-ink">&ldquo;{data.latestReflection.reflection_text}&rdquo;</p>
          ) : (
            <EmptyState message="ยังไม่มีข้อความสะท้อนตัวเอง ลองเขียนที่หน้าทบทวน" />
          )}
        </Card>
      </section>
    </div>
  );
}
