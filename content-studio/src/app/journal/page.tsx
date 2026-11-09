"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDownToLine, BookHeart, Check, ChevronLeft, ChevronRight, Lightbulb, ListChecks, Sparkles } from "lucide-react";
import { EMPTY_TODOS, useStore } from "@/lib/store/StoreProvider";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, TextInput } from "@/components/ui/Form";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useFeedback } from "@/components/ui/Feedback";
import type { TodoItem } from "@/lib/types";
import { addDays, fmt, parseDateStr, relativeDayLabel, toDateStr, todayStr } from "@/lib/date";
import { cn } from "@/lib/utils";
import { GratitudeToday } from "@/components/goal/Gratitude";
import { ReviewToday } from "@/components/goal/Review";

const TODO_COUNT = 5;

/** Always exactly 5 slots. */
function normalize(todos: TodoItem[] | undefined | null): TodoItem[] {
  const base = Array.isArray(todos) ? todos.slice(0, TODO_COUNT) : [];
  while (base.length < TODO_COUNT) base.push({ text: "", done: false });
  return base;
}

export default function JournalPage() {
  const store = useStore();
  const { toast } = useFeedback();
  const [date, setDate] = useState(todayStr());
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const log = store.dailyLogs.find((l) => l.date === date);
  const todos = normalize(log?.todos);
  const experience = log?.experience ?? "";
  const lesson = log?.lesson ?? "";
  const filled = todos.filter((t) => t.text.trim());
  const done = filled.filter((t) => t.done).length;

  // unfinished items from the previous day, offered when today's list is empty
  const prevDate = toDateStr(addDays(parseDateStr(date), -1));
  const carryOver = useMemo(() => {
    const prev = store.dailyLogs.find((l) => l.date === prevDate);
    return normalize(prev?.todos).filter((t) => t.text.trim() && !t.done);
  }, [store.dailyLogs, prevDate]);

  const history = useMemo(
    () =>
      store.dailyLogs
        .filter((l) => l.experience.trim() || l.lesson.trim() || normalize(l.todos).some((t) => t.text.trim()))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 30),
    [store.dailyLogs],
  );

  if (!store.ready) return <PageSkeleton />;

  const setTodo = (i: number, patch: Partial<TodoItem>) => {
    const next = todos.map((t, j) => (j === i ? { ...t, ...patch } : t));
    store.saveDailyLog(date, { todos: next });
  };

  const pullCarryOver = () => {
    const next = [...carryOver.map((t) => ({ text: t.text, done: false })), ...EMPTY_TODOS()].slice(0, TODO_COUNT);
    store.saveDailyLog(date, { todos: next });
    toast(`ดึงงานที่ค้าง ${Math.min(carryOver.length, TODO_COUNT)} ข้อมาแล้ว`);
  };

  const toIdea = () => {
    const source = experience.trim() || lesson.trim();
    if (!source) return;
    const firstLine = (lesson.trim() || experience.trim()).split("\n")[0].slice(0, 120);
    store.addIdea({
      title: firstLine,
      details: [experience.trim(), lesson.trim() && `สิ่งที่ได้เรียนรู้: ${lesson.trim()}`].filter(Boolean).join("\n\n"),
      kind: "content",
      source: "experience",
      sourceNote: `บันทึกประจำวัน ${fmt.short(parseDateStr(date))}`,
    });
    toast("ส่งเข้า Idea Inbox แล้ว");
  };

  const isToday = date === todayStr();

  return (
    <PageContainer wide>
      <PageHeader title="Daily Journal" description="ลงมือ 5 อย่าง และบันทึกประสบการณ์ของแต่ละวัน" />

      {/* date navigator */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Button size="icon" variant="secondary" aria-label="วันก่อนหน้า" onClick={() => setDate(toDateStr(addDays(parseDateStr(date), -1)))}>
          <ChevronLeft size={17} />
        </Button>
        <Button size="icon" variant="secondary" aria-label="วันถัดไป" onClick={() => setDate(toDateStr(addDays(parseDateStr(date), 1)))}>
          <ChevronRight size={17} />
        </Button>
        {!isToday && (
          <Button variant="ghost" onClick={() => setDate(todayStr())}>
            วันนี้
          </Button>
        )}
        <h2 className="ml-1 font-display text-lg font-semibold tracking-tight">
          {fmt.long(parseDateStr(date))}
          {isToday && <span className="ml-2 rounded-full bg-primary-soft px-2 py-0.5 align-middle text-xs font-medium text-primary">วันนี้</span>}
        </h2>
        <TextInput type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="เลือกวันที่" className="ml-auto h-9 w-44!" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* ---- 5 to-dos ---- */}
        <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
                <ListChecks size={18} />
              </span>
              5 สิ่งที่ต้องทำ
            </h2>
            <span className="font-display text-sm text-muted tabular-nums">
              <span className="text-lg font-semibold text-ink">{done}</span>/{filled.length || TODO_COUNT} เสร็จแล้ว
            </span>
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-subtle">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet transition-all"
              style={{ width: `${filled.length ? (done / filled.length) * 100 : 0}%` }}
            />
          </div>

          <ol className="space-y-2">
            {todos.map((t, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-1.5 transition-colors",
                  t.done ? "border-transparent bg-subtle" : "border-line focus-within:border-primary",
                )}
              >
                <span className="w-4 shrink-0 text-center font-display text-sm text-faint">{i + 1}</span>
                <input
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  value={t.text}
                  onChange={(e) => setTodo(i, { text: e.target.value, ...(e.target.value.trim() ? {} : { done: false }) })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      inputs.current[i + 1]?.focus();
                    }
                  }}
                  placeholder={i === 0 ? "สิ่งสำคัญที่สุดของวันนี้" : `สิ่งที่ต้องทำข้อ ${i + 1}`}
                  aria-label={`สิ่งที่ต้องทำข้อ ${i + 1}`}
                  className={cn(
                    "h-10 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-faint focus:outline-none",
                    t.done && "text-muted line-through decoration-faint",
                  )}
                />
                <button
                  type="button"
                  onClick={() => t.text.trim() && setTodo(i, { done: !t.done })}
                  disabled={!t.text.trim()}
                  aria-label={t.done ? `ยกเลิกเสร็จ ข้อ ${i + 1}` : `ทำเสร็จแล้ว ข้อ ${i + 1}`}
                  aria-pressed={t.done}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors disabled:opacity-30",
                    t.done ? "border-success bg-success text-white" : "border-line-strong text-transparent hover:border-success hover:text-success",
                  )}
                >
                  <Check size={14} strokeWidth={3} />
                </button>
              </li>
            ))}
          </ol>

          {filled.length === 0 && carryOver.length > 0 && (
            <button
              onClick={pullCarryOver}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong py-2.5 text-[13px] text-muted hover:border-primary hover:text-primary"
            >
              <ArrowDownToLine size={15} /> ดึงงานที่ค้างจาก{relativeDayLabel(prevDate) === "เมื่อวาน" ? "เมื่อวาน" : ` ${fmt.short(parseDateStr(prevDate))}`} ({carryOver.length})
            </button>
          )}
          {filled.length > 0 && done === filled.length && (
            <p className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-success-soft py-2.5 text-[13px] font-medium text-success">
              <Sparkles size={15} /> ทำครบทุกข้อแล้ว เก่งมาก!
            </p>
          )}
        </section>

        {/* ---- experience journal ---- */}
        <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2.5 text-[16px] font-semibold">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet text-white">
                <BookHeart size={18} />
              </span>
              บันทึกประสบการณ์
            </h2>
            <span className="text-xs text-faint">บันทึกอัตโนมัติ</span>
          </div>

          <p className="mb-1 text-xs font-medium tracking-wide text-muted">วันนี้เกิดอะไรขึ้น</p>
          <AutoTextarea
            minRows={6}
            value={experience}
            onChange={(e) => store.saveDailyLog(date, { experience: e.target.value })}
            placeholder="เรื่องที่เจอ คนที่คุยด้วย ความรู้สึก หรือช่วงเวลาที่อยากจำ…"
            aria-label="บันทึกประสบการณ์"
            className="text-[15px]!"
          />
          <p className="mt-4 mb-1 text-xs font-medium tracking-wide text-muted">สิ่งที่ได้เรียนรู้</p>
          <AutoTextarea
            minRows={2}
            value={lesson}
            onChange={(e) => store.saveDailyLog(date, { lesson: e.target.value })}
            placeholder="บทเรียนหนึ่งประโยคจากวันนี้"
            aria-label="สิ่งที่ได้เรียนรู้"
          />
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={toIdea} disabled={!experience.trim() && !lesson.trim()} title="ส่งประสบการณ์นี้เข้า Idea Inbox เพื่อทำเป็นคอนเทนต์">
              <Lightbulb size={14} /> ทำเป็นไอเดียคอนเทนต์
            </Button>
          </div>
        </section>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ReviewToday date={date} />
        <GratitudeToday date={date} compact />
      </div>

      {/* ---- history ---- */}
      <section className="mt-8">
        <h2 className="mb-3 text-[15px] font-semibold">บันทึกย้อนหลัง</h2>
        {history.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-muted">
            เริ่มบันทึกวันนี้ แล้ววันที่ผ่านมาจะแสดงตรงนี้
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {history.map((l) => {
              const t = normalize(l.todos).filter((x) => x.text.trim());
              const d = t.filter((x) => x.done).length;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setDate(l.date);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={cn(
                    "rounded-2xl bg-card p-4 text-left shadow-card transition-shadow hover:shadow-pop",
                    l.date === date && "ring-2 ring-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">
                      {relativeDayLabel(l.date)} · {fmt.weekday(parseDateStr(l.date))}
                    </span>
                    {t.length > 0 && (
                      <span className={cn("rounded-full px-2 py-0.5 text-xs tabular-nums", d === t.length ? "bg-success-soft text-success" : "bg-subtle text-muted")}>
                        ✓ {d}/{t.length}
                      </span>
                    )}
                  </div>
                  {(l.experience.trim() || l.lesson.trim()) && (
                    <p className="mt-1.5 line-clamp-2 text-[13px] text-muted">{l.experience.trim() || l.lesson.trim()}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
