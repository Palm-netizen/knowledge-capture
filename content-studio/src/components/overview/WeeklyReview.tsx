"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronDown, Heart, ListChecks, Send, Target } from "lucide-react";
import { METRICS } from "@/lib/goal-content";
import type { Publication } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Segmented } from "@/components/ui/Form";
import { averageReview } from "@/components/goal/Review";
import { addDays, fmt, isoToDateStr, startOfWeek, toDateStr } from "@/lib/date";
import { cn } from "@/lib/utils";

type Which = "this" | "last";
const intentKey = (monday: string) => `week-intent:${monday}`;

const postDay = (p: Publication) =>
  p.status === "published" ? (p.publishedAt ? isoToDateStr(p.publishedAt) : p.scheduledDate) : null;

/**
 * ทบทวนสัปดาห์ — the week in one card: posts, to-dos, gratitude, the 5 self-review
 * scores vs the week before, lessons, and 3 intentions for next week.
 * Opens by itself Fri–Sun; collapsed on other days.
 */
export function WeeklyReview() {
  const store = useStore();
  const dow = new Date().getDay(); // 0 Sun … 6 Sat
  const weekend = dow === 0 || dow === 5 || dow === 6;
  const [which, setWhich] = useState<Which>(weekend ? "this" : "last");
  const [open, setOpen] = useState(weekend);

  const thisMonday = startOfWeek(new Date());
  const monday = which === "this" ? thisMonday : addDays(thisMonday, -7);
  const days = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(monday, i)));
  const prevDays = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(monday, i - 7)));
  const nextMonday = toDateStr(addDays(monday, 7));
  const range = `${fmt.short(monday)} – ${fmt.short(addDays(monday, 6))}`;

  const stats = useMemo(() => {
    const inWeek = (d: string | null) => !!d && d >= days[0] && d <= days[6];
    const posts = store.publications.filter((p) => inWeek(postDay(p)));
    const logs = store.dailyLogs.filter((l) => inWeek(l.date));
    const todos = logs.flatMap((l) => (l.todos ?? []).filter((t) => t.text.trim()));
    const gratitudeDays = logs.filter((l) => (l.gratitude ?? []).some((g) => g.trim())).length;
    const lessons = [
      ...logs.filter((l) => l.lesson.trim()).map((l) => ({ text: l.lesson.trim(), date: l.date })),
      ...posts.filter((p) => p.learnings.trim()).map((p) => ({ text: p.learnings.trim(), date: postDay(p)! })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    return { posts: posts.length, todosDone: todos.filter((t) => t.done).length, todosTotal: todos.length, gratitudeDays, lessons };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.publications, store.dailyLogs, days[0]]);

  // intentions written for the week after the one shown
  const saved = store.getSetting<string[]>(intentKey(nextMonday), []);
  const [intent, setIntent] = useState<string[]>(["", "", ""]);
  useEffect(() => {
    setIntent([0, 1, 2].map((i) => saved[i] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextMonday, JSON.stringify(saved)]);
  const saveIntent = (i: number, v: string) => {
    const next = intent.map((x, j) => (j === i ? v : x));
    setIntent(next);
    store.saveSetting(intentKey(nextMonday), next);
  };

  // this week's intentions (written last week) — shown even when collapsed
  const current = store.getSetting<string[]>(intentKey(toDateStr(thisMonday)), []).filter((s) => s.trim());

  return (
    <section className="rounded-3xl bg-card shadow-card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-5 text-left md:px-7" aria-expanded={open}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet text-white">
          <BookOpen size={19} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-semibold tracking-tight">ทบทวนสัปดาห์</span>
          <span className="block truncate text-[13px] text-muted">
            {which === "this" ? "สัปดาห์นี้" : "สัปดาห์ที่แล้ว"} · {range} · โพสต์ {stats.posts} · To-do {stats.todosDone}/{stats.todosTotal} · ขอบคุณ {stats.gratitudeDays} วัน
          </span>
        </span>
        <ChevronDown size={18} className={cn("shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {current.length > 0 && (
        <div className="-mt-1 flex flex-wrap items-center gap-1.5 px-5 pb-4 md:px-7">
          <span className="flex items-center gap-1 text-xs font-medium text-violet">
            <Target size={13} /> ตั้งใจสัปดาห์นี้:
          </span>
          {current.map((c) => (
            <span key={c} className="rounded-full bg-violet-soft px-2.5 py-1 text-xs text-ink">
              {c}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="animate-fade space-y-6 border-t border-line p-5 md:px-7 md:pb-7">
          <Segmented<Which>
            value={which}
            onChange={setWhich}
            options={[
              { value: "this", label: "สัปดาห์นี้" },
              { value: "last", label: "สัปดาห์ที่แล้ว" },
            ]}
            className="mx-0 px-0"
          />

          <div className="grid grid-cols-3 gap-3">
            <Stat icon={Send} tone="bg-primary-soft text-primary" value={`${stats.posts}`} label="โพสต์แล้ว" />
            <Stat icon={ListChecks} tone="bg-subtle text-ink" value={`${stats.todosDone}/${stats.todosTotal}`} label="To-do ที่ทำเสร็จ" />
            <Stat icon={Heart} tone="bg-[#FFEEF4] text-[#C2336A]" value={`${stats.gratitudeDays}/7`} label="วันที่ขอบคุณ" />
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold">คะแนนทบทวนตัวเอง (เฉลี่ย / 5)</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {METRICS.map((m) => {
                const avg = averageReview(store.dailyLogs, m.key, days);
                const prev = averageReview(store.dailyLogs, m.key, prevDays);
                const d = avg !== null && prev !== null ? avg - prev : null;
                return (
                  <div key={m.key} className="rounded-2xl bg-subtle/70 px-3 py-2.5">
                    <p className="text-xs text-muted">{m.measure}</p>
                    <p className="font-display text-xl font-semibold tabular-nums">{avg === null ? "–" : avg.toFixed(1)}</p>
                    {d !== null &&
                      (Math.abs(d) < 0.05 ? (
                        <p className="text-[11px] font-medium text-muted">เท่าเดิม</p>
                      ) : (
                        <p className={cn("text-[11px] font-medium", d > 0 ? "text-success" : "text-[#B65A00]")}>
                          {d > 0 ? "▲ +" : "▼ "}
                          {d.toFixed(1)}
                        </p>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-semibold">บทเรียนของสัปดาห์</p>
            {stats.lessons.length === 0 ? (
              <p className="text-[13px] text-muted">ยังไม่มีบทเรียน — เขียน “สิ่งที่ได้เรียนรู้” ใน Daily Journal หรือหลังบันทึกผลโพสต์</p>
            ) : (
              <ul className="space-y-1.5">
                {stats.lessons.slice(0, 5).map((l, i) => (
                  <li key={i} className="flex gap-2 text-[14px]">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                    <span>{l.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-violet-soft/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
              <Target size={15} className="text-violet" /> ตั้งใจสำหรับสัปดาห์ถัดไป ({fmt.short(parseMonday(nextMonday))} เป็นต้นไป)
            </p>
            <div className="space-y-2">
              {intent.map((t, i) => (
                <input
                  key={i}
                  value={t}
                  onChange={(e) => saveIntent(i, e.target.value)}
                  placeholder={["สิ่งที่อยากทำให้ได้ เช่น ไลฟ์ 1 ครั้ง", "นิสัยที่อยากฝึก", "สิ่งที่จะไม่ทำ"][i]}
                  aria-label={`ความตั้งใจข้อ ${i + 1}`}
                  className="h-10 w-full rounded-xl border border-line bg-card px-3 text-[14px] placeholder:text-faint focus:border-violet focus:outline-none"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function parseMonday(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function Stat({ icon: Icon, tone, value, label }: { icon: typeof Send; tone: string; value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-subtle/70 p-3">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", tone)}>
        <Icon size={15} />
      </span>
      <p className="mt-2 font-display text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}
