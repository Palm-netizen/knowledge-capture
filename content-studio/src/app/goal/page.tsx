"use client";

import { Anchor, Camera, Flame, HeartHandshake, Mic, Repeat, Sparkles, UserRoundPlus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { VisionBoard } from "@/components/goal/VisionBoard";
import { Highlight } from "@/components/goal/Highlight";
import { AdvanceGratitude, GratitudeRecall, GratitudeToday } from "@/components/goal/Gratitude";
import { CLOSING, GOALS, HERO_REMINDER, METRICS, METRICS_INTRO, MISSION, REMINDERS } from "@/lib/goal-content";
import { cn } from "@/lib/utils";

const GOAL_ICONS = [UserRoundPlus, Flame, Mic, Camera, Anchor, Repeat];
const GOAL_TONES = [
  "bg-primary text-white",
  "bg-orange text-white",
  "bg-violet text-white",
  "bg-ink text-white",
  "bg-success text-white",
  "bg-[#D2559A] text-white",
];

export default function GoalPage() {
  return (
    <PageContainer wide>
      <PageHeader title="Goal" description="Manifest — เห็นภาพให้ชัด แล้วลงมือทุกวัน" />

      <VisionBoard />

      {/* gratitude */}
      <div className="mt-6 space-y-4 md:mt-8">
        <AdvanceGratitude />
        <GratitudeToday />
        <GratitudeRecall />
      </div>

      {/* mission */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-ink p-6 text-white md:mt-8 md:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/50 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-violet/40 blur-3xl" aria-hidden />
        <p className="relative flex items-center gap-2 text-sm font-medium text-white/70">
          <Sparkles size={16} className="text-orange" /> {MISSION.eyebrow}
        </p>
        <p className="relative mt-3 max-w-3xl font-display text-[24px] leading-snug font-semibold md:text-[34px]">
          <Highlight text={MISSION.text} tone="light" />
        </p>
      </section>

      {/* 6 goals */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">6 เป้าหมายที่ฉันกำลังสร้าง</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
          {GOALS.map((g, i) => {
            const Icon = GOAL_ICONS[i];
            return (
              <article key={g.title} className="rounded-3xl bg-card p-5 shadow-card md:p-6">
                <div className="flex items-center gap-3">
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", GOAL_TONES[i])}>
                    <Icon size={20} />
                  </span>
                  <span className="font-display text-sm text-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-[17px] font-semibold">{g.title}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">
                  <Highlight text={g.body} />
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* new success metrics */}
      <section className="mt-8 rounded-3xl bg-card p-5 shadow-card md:p-7">
        <h2 className="font-display text-xl font-semibold tracking-tight">เปลี่ยนตัวชี้วัดความสำเร็จ</h2>
        <p className="mt-1.5 text-[14.5px] text-muted">
          <Highlight text={METRICS_INTRO} tone="blue" />
        </p>
        <div className="mt-5 overflow-hidden rounded-2xl border border-line">
          <div className="grid grid-cols-[8rem_minmax(0,1fr)] bg-subtle text-xs font-medium text-muted md:grid-cols-[12rem_minmax(0,1fr)]">
            <span className="px-4 py-2.5">สิ่งที่วัด</span>
            <span className="px-4 py-2.5">คำถามที่ใช้ทบทวน</span>
          </div>
          {METRICS.map((m) => (
            <div key={m.measure} className="grid grid-cols-[8rem_minmax(0,1fr)] border-t border-line md:grid-cols-[12rem_minmax(0,1fr)]">
              <span className="px-4 py-3.5 text-[15px] font-semibold text-primary">{m.measure}</span>
              <span className="px-4 py-3.5 text-[15px]">{m.question}</span>
            </div>
          ))}
        </div>
      </section>

      {/* reminders */}
      <section className="mt-8">
        <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">ประโยคเตือนตัวเอง</h2>
        <div className="rounded-3xl bg-gradient-to-br from-primary to-violet p-6 text-center text-white md:p-10">
          <HeartHandshake size={28} className="mx-auto text-white/80" />
          <p className="mx-auto mt-3 max-w-2xl font-display text-[24px] leading-snug font-semibold md:text-[32px]">
            <Highlight text={HERO_REMINDER} tone="light" />
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:mt-4 md:grid-cols-3 md:gap-4">
          {REMINDERS.map((r) => (
            <blockquote key={r} className="rounded-3xl border-l-4 border-orange bg-card p-5 text-[15px] leading-relaxed shadow-card md:p-6">
              <Highlight text={r} />
            </blockquote>
          ))}
        </div>
      </section>

      {/* closing */}
      <section className="mt-8 space-y-3 rounded-3xl bg-card p-5 shadow-card md:p-7">
        {CLOSING.map((c) => (
          <p key={c} className="text-[15.5px] leading-relaxed">
            <Highlight text={c} tone="blue" />
          </p>
        ))}
      </section>
    </PageContainer>
  );
}
