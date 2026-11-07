"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lightbulb, Minus, PenLine, Plus, Target } from "lucide-react";
import type { Publication } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { addDays, isoToDateStr, startOfWeek, toDateStr, todayStr } from "@/lib/date";
import { cn } from "@/lib/utils";

const GOAL_KEY = "supperpalm-weekly-goal";
const DAY_LABELS = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

/** The day a post counts for: when it was actually posted, otherwise its planned date. */
function postDay(p: Publication): string | null {
  if (p.status === "published") return p.publishedAt ? isoToDateStr(p.publishedAt) : p.scheduledDate;
  return p.scheduledDate;
}

function readGoal(): number {
  try {
    const n = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(n) && n > 0 ? n : 5;
  } catch {
    return 5;
  }
}

/** สรุปรายสัปดาห์ — posts per day (posted vs planned), goal, vs last week, monthly consistency. */
export function WeeklySummary() {
  const store = useStore();
  const [goal, setGoal] = useState(5);
  useEffect(() => setGoal(readGoal()), []);
  const changeGoal = (d: number) => {
    const next = Math.min(50, Math.max(1, goal + d));
    setGoal(next);
    try {
      localStorage.setItem(GOAL_KEY, String(next));
    } catch {
      /* preference only */
    }
  };

  const today = todayStr();
  const data = useMemo(() => {
    const start = startOfWeek(new Date());
    const days = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(start, i)));
    const lastStart = toDateStr(addDays(start, -7));
    const lastEnd = toDateStr(addDays(start, -1));

    const perDay = days.map((d) => {
      const list = store.publications.filter((p) => postDay(p) === d);
      return {
        date: d,
        posted: list.filter((p) => p.status === "published").length,
        planned: list.filter((p) => p.status !== "published").length,
      };
    });
    const posted = perDay.reduce((n, d) => n + d.posted, 0);
    const planned = perDay.reduce((n, d) => n + d.planned, 0);
    const lastWeek = store.publications.filter((p) => {
      const d = p.status === "published" ? postDay(p) : null;
      return d !== null && d >= lastStart && d <= lastEnd;
    }).length;

    const inWeek = (iso: string) => {
      const d = isoToDateStr(iso);
      return d >= days[0] && d <= days[6];
    };
    const ideas = store.ideas.filter((i) => inWeek(i.createdAt)).length;
    const contents = store.contents.filter((c) => inWeek(c.createdAt)).length;
    const lesson = store.publications
      .filter((p) => p.learnings.trim())
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]?.learnings;

    // monthly consistency: days of this month with at least one posted post
    const now = new Date();
    const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const prefix = today.slice(0, 7);
    const postedDays = new Set(
      store.publications
        .filter((p) => p.status === "published")
        .map(postDay)
        .filter((d): d is string => !!d && d.startsWith(prefix)),
    );

    return { perDay, posted, planned, lastWeek, ideas, contents, lesson, monthDays, postedDays, prefix };
  }, [store.publications, store.ideas, store.contents, today]);

  const max = Math.max(2, ...data.perDay.map((d) => d.posted + d.planned));
  const progress = Math.min(1, data.posted / goal);
  const delta =
    data.lastWeek === 0 ? null : Math.round(((data.posted - data.lastWeek) / data.lastWeek) * 100);

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight md:text-[22px]">สรุปสัปดาห์นี้</h2>
          <p className="mt-0.5 text-sm text-muted">จำนวนโพสต์รายวัน · สีเต็ม = โพสต์แล้ว · ลายเส้น = วางแผนไว้</p>
        </div>
        <Link href="/calendar" className="rounded-full bg-subtle px-3 py-1.5 text-xs text-muted hover:text-ink">
          เปิดปฏิทิน
        </Link>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:gap-10">
        {/* left: headline number + goal */}
        <div className="flex flex-col justify-between rounded-2xl bg-subtle p-5">
          <div>
            <p className="font-display text-[44px] leading-none font-semibold tracking-tight tabular-nums">
              {data.posted}
              <span className="ml-1.5 text-lg font-medium text-muted">/ {goal} โพสต์</span>
            </p>
            <p className="mt-2 text-sm text-muted">โพสต์แล้วสัปดาห์นี้</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span
              className={cn(
                "mt-3 inline-flex rounded-lg bg-card px-2 py-1 text-xs font-medium",
                delta === null ? "text-muted" : delta >= 0 ? "text-success" : "text-[#B65A00]",
              )}
            >
              {delta === null ? `วางแผนไว้อีก ${data.planned} โพสต์` : `${delta >= 0 ? "+" : ""}${delta}% เทียบสัปดาห์ก่อน`}
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Target size={14} /> เป้าต่อสัปดาห์
            </span>
            <span className="flex items-center gap-1">
              <button onClick={() => changeGoal(-1)} aria-label="ลดเป้า" className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-muted hover:text-ink">
                <Minus size={14} />
              </button>
              <span className="w-7 text-center font-display text-sm font-semibold tabular-nums" aria-label="เป้าหมาย">
                {goal}
              </span>
              <button onClick={() => changeGoal(1)} aria-label="เพิ่มเป้า" className="flex h-7 w-7 items-center justify-center rounded-lg bg-card text-muted hover:text-ink">
                <Plus size={14} />
              </button>
            </span>
          </div>
        </div>

        {/* right: daily bars */}
        <div className="flex items-end justify-between gap-2 pt-10 sm:gap-3">
          {data.perDay.map((d, i) => {
            const total = d.posted + d.planned;
            const h = 168; // px, full bar height
            const isToday = d.date === today;
            return (
              <Link key={d.date} href="/calendar" className="group flex flex-1 flex-col items-center gap-2" title={`${d.posted} โพสต์แล้ว · ${d.planned} วางแผน`}>
                <div className="flex w-full max-w-14 flex-col justify-end" style={{ height: h }}>
                  <div
                    className={cn("relative flex w-full flex-col rounded-full transition-all", total === 0 && "bg-subtle")}
                    style={{ height: total === 0 ? h * 0.2 : h * (0.32 + 0.68 * (total / max)) }}
                  >
                    {isToday && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 text-[11px] whitespace-nowrap text-white">
                        วันนี้ {total}
                      </span>
                    )}
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-full">
                      {d.planned > 0 && <div className="bar-hatched w-full bg-violet-soft" style={{ flex: d.planned }} />}
                      {d.posted > 0 && (
                        <div
                          className={cn("w-full bg-gradient-to-b", i % 2 ? "from-violet to-primary" : "from-[#9b8bff] to-violet")}
                          style={{ flex: d.posted }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <span className={cn("text-sm", isToday ? "font-semibold text-ink" : "text-muted")}>{DAY_LABELS[i]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* footer: week facts + monthly consistency */}
      <div className="mt-6 grid gap-4 border-t border-line pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
        <div className="grid grid-cols-2 gap-3">
          <Fact icon={Lightbulb} tone="bg-orange-soft text-orange" value={data.ideas} label="ไอเดียที่จดสัปดาห์นี้" />
          <Fact icon={PenLine} tone="bg-violet-soft text-violet" value={data.contents} label="คอนเทนต์ที่เริ่มใหม่" />
        </div>
        <div>
          <p className="text-sm">
            <span className="font-display text-2xl font-semibold tabular-nums">{data.postedDays.size}</span>
            <span className="ml-1.5 text-muted">วันที่โพสต์ในเดือนนี้</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5" aria-label="วันที่โพสต์ในเดือนนี้">
            {Array.from({ length: data.monthDays }, (_, i) => {
              const ds = `${data.prefix}-${String(i + 1).padStart(2, "0")}`;
              const on = data.postedDays.has(ds);
              return (
                <span
                  key={ds}
                  title={`${i + 1}`}
                  className={cn("h-3.5 w-3.5 rounded-full", on ? "bg-orange" : ds <= today ? "bg-line-strong" : "bg-subtle")}
                />
              );
            })}
          </div>
        </div>
      </div>

      {data.lesson && (
        <p className="mt-5 flex gap-2 rounded-2xl bg-primary-soft px-4 py-3 text-[13px] text-ink">
          <Lightbulb size={15} className="mt-0.5 shrink-0 text-primary" />
          <span>
            <span className="font-medium">บทเรียนล่าสุด: </span>
            <span className="line-clamp-2">{data.lesson}</span>
          </span>
        </p>
      )}
    </section>
  );
}

function Fact({ icon: Icon, tone, value, label }: { icon: typeof Lightbulb; tone: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tone)}>
        <Icon size={18} />
      </span>
      <span>
        <span className="block font-display text-xl leading-tight font-semibold tabular-nums">{value}</span>
        <span className="block text-xs text-muted">{label}</span>
      </span>
    </div>
  );
}
