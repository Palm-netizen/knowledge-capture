"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, TrendingDown, TrendingUp } from "lucide-react";
import { METRICS } from "@/lib/goal-content";
import type { DailyLog, ReviewKey } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { addDays, fmt, parseDateStr, toDateStr, todayStr } from "@/lib/date";
import { cn } from "@/lib/utils";

const SCALE = [1, 2, 3, 4, 5] as const;
const SCALE_HINT: Record<number, string> = { 1: "ยังไม่ได้เลย", 2: "นิดหน่อย", 3: "พอใช้", 4: "ดี", 5: "ดีมาก" };

/** Average score for a metric over the given dates (only days that were rated). */
export function averageReview(logs: DailyLog[], key: ReviewKey, dates: string[]): number | null {
  const set = new Set(dates);
  const vals = logs.filter((l) => set.has(l.date)).map((l) => l.review?.[key]).filter((v): v is number => typeof v === "number");
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
}

export const datesBack = (end: Date, n: number) => Array.from({ length: n }, (_, i) => toDateStr(addDays(end, -i)));

/* ------------------------------------------------------------------ */
/** ทบทวนวันนี้ — rate yourself 1–5 on the 5 success metrics (Daily Journal). */
export function ReviewToday({ date = todayStr() }: { date?: string }) {
  const store = useStore();
  const log = store.dailyLogs.find((l) => l.date === date);
  const review = log?.review ?? {};
  const rated = METRICS.filter((m) => typeof review[m.key] === "number").length;

  const setScore = (key: ReviewKey, v: number) => {
    const next = { ...review };
    if (next[key] === v) delete next[key];
    else next[key] = v;
    store.saveDailyLog(date, { review: next });
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[16px] font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <ClipboardCheck size={18} />
          </span>
          ทบทวน 5 คำถาม
        </h2>
        <span className="text-xs text-muted tabular-nums">ตอบแล้ว {rated}/5</span>
      </div>
      <p className="mb-4 text-[13px] text-muted">วัดความเติบโตของตัวเอง ไม่ใช่ยอดไลก์ — ให้คะแนน 1 (ยังไม่ได้เลย) ถึง 5 (ดีมาก)</p>
      <div className="space-y-3">
        {METRICS.map((m) => (
          <div key={m.key} className="flex flex-col gap-2 rounded-2xl bg-subtle/70 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-primary">{m.measure}</p>
              <p className="text-[13px] text-ink">{m.question}</p>
            </div>
            <div className="flex shrink-0 gap-1.5" role="radiogroup" aria-label={m.measure}>
              {SCALE.map((v) => {
                const on = review[m.key] === v;
                return (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${m.measure} ${v} — ${SCALE_HINT[v]}`}
                    title={SCALE_HINT[v]}
                    onClick={() => setScore(m.key, v)}
                    className={cn(
                      "h-10 w-10 rounded-xl border font-display text-[15px] font-semibold transition-colors",
                      on ? "border-primary bg-primary text-white" : "border-line bg-card text-muted hover:border-primary/50 hover:text-ink",
                    )}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/**
 * ความเติบโตของฉัน — small multiples: one row per metric, 30-day line (gaps on
 * unrated days), this-week average as the headline and the change vs last week.
 */
export function ReviewTrends() {
  const { dailyLogs } = useStore();
  const end = parseDateStr(todayStr());
  const days = useMemo(() => datesBack(end, 30).reverse(), [end.getTime()]); // oldest → newest
  const thisWeek = datesBack(end, 7);
  const lastWeek = datesBack(addDays(end, -7), 7);
  const byDate = useMemo(() => new Map(dailyLogs.map((l) => [l.date, l])), [dailyLogs]);
  const ratedDays = days.filter((d) => Object.keys(byDate.get(d)?.review ?? {}).length > 0).length;

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card md:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight">ความเติบโตของฉัน</h2>
        <span className="text-xs text-muted">30 วันล่าสุด · ทบทวนแล้ว {ratedDays} วัน</span>
      </div>
      <p className="mt-1 text-[13px] text-muted">คะแนนจาก “ทบทวน 5 คำถาม” ในหน้า Daily Journal · ตัวเลขใหญ่ = ค่าเฉลี่ย 7 วันล่าสุด</p>

      {ratedDays === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-muted">
          เริ่มให้คะแนนตัวเองใน Daily Journal ทุกเย็น แล้วกราฟการเติบโตจะขึ้นที่นี่
        </p>
      ) : (
        <div className="mt-5 divide-y divide-line">
          {METRICS.map((m) => {
            const avg = averageReview(dailyLogs, m.key, thisWeek);
            const prev = averageReview(dailyLogs, m.key, lastWeek);
            const delta = avg !== null && prev !== null ? avg - prev : null;
            return (
              <div key={m.key} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-4 py-3.5 md:grid-cols-[10rem_minmax(0,1fr)_6rem]">
                <div>
                  <p className="text-[14px] font-semibold">{m.measure}</p>
                  <p className="mt-0.5 flex items-baseline gap-2">
                    <span className="font-display text-2xl font-semibold tabular-nums">{avg === null ? "–" : avg.toFixed(1)}</span>
                    <span className="text-xs text-muted">/ 5</span>
                  </p>
                </div>
                <Sparkline values={days.map((d) => byDate.get(d)?.review?.[m.key] ?? null)} dates={days} label={m.measure} />
                <div className="col-span-2 text-xs md:col-span-1 md:text-right">
                  {delta === null ? (
                    <span className="text-faint">ยังไม่มีข้อมูลเทียบ</span>
                  ) : Math.abs(delta) < 0.05 ? (
                    <span className="font-medium text-muted">เท่าเดิมกับสัปดาห์ก่อน</span>
                  ) : (
                    <span className={cn("inline-flex items-center gap-1 font-medium", delta >= 0 ? "text-success" : "text-[#B65A00]")}>
                      {delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {delta >= 0 ? "+" : ""}
                      {delta.toFixed(1)} จากสัปดาห์ก่อน
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/** 30-day line on a fixed 1–5 scale; breaks over unrated days; hover shows the day's score. */
function Sparkline({ values, dates, label }: { values: (number | null)[]; dates: string[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 300;
  const H = 56;
  const pad = 6;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (values.length - 1);
  const y = (v: number) => H - pad - ((v - 1) / 4) * (H - pad * 2);

  // split into continuous runs so unrated days show as gaps
  const runs: { i: number; v: number }[][] = [];
  values.forEach((v, i) => {
    if (v === null) return;
    const last = runs[runs.length - 1];
    if (last && last[last.length - 1].i === i - 1) last.push({ i, v });
    else runs.push([{ i, v }]);
  });

  const h = hover !== null ? values[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-14 w-full overflow-visible"
        role="img"
        aria-label={`${label} 30 วันล่าสุด`}
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const rel = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(values.length - 1, Math.round(((rel - pad) / (W - pad * 2)) * (values.length - 1)))));
        }}
      >
        {/* recessive guides at 1, 3, 5 */}
        {[1, 3, 5].map((g) => (
          <line key={g} x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        {runs.map((run, k) =>
          run.length > 1 ? (
            <polyline
              key={k}
              points={run.map((p) => `${x(p.i)},${y(p.v)}`).join(" ")}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={pad} y2={H - pad} stroke="var(--color-faint)" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
      </svg>
      {/* dots as HTML so they stay round when the svg stretches */}
      {values.map((v, i) =>
        v === null ? null : (
          <span
            key={i}
            className={cn(
              "pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-card",
              hover === i && "h-2.5 w-2.5",
            )}
            style={{ left: `${(x(i) / W) * 100}%`, top: `${(y(v) / H) * 100}%` }}
          />
        ),
      )}
      {hover !== null && (
        <span
          className="pointer-events-none absolute -top-7 z-10 -translate-x-1/2 rounded-lg bg-ink px-2 py-1 text-[11px] whitespace-nowrap text-white"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          {fmt.short(parseDateStr(dates[hover]))} · {h === null ? "ไม่ได้ทบทวน" : `${h}/5`}
        </span>
      )}
    </div>
  );
}
