"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { PageContainer, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, TextInput } from "@/components/ui/Form";
import { PageSkeleton } from "@/components/ui/Skeleton";
import {
  DAILY_GROUPS,
  DAILY_TOTAL,
  EMPTY_MONTHLY,
  EMPTY_WEEKLY,
  LEVELS,
  MONTHLY_NUMBERS,
  MONTHLY_QUESTIONS,
  WEEKLY_ITEMS,
  checklistKey,
  monthlyKey,
  weeklyKey,
  type LevelKey,
  type MonthlyEntry,
  type WeeklyEntry,
} from "@/lib/scorecard";
import { addDays, fmt, parseDateStr, relativeDayLabel, startOfWeek, toDateStr, todayStr } from "@/lib/date";
import { cn } from "@/lib/utils";

export default function ScorecardPage() {
  const store = useStore();
  const [level, setLevel] = useState<LevelKey>("daily");
  if (!store.ready) return <PageSkeleton />;
  const current = LEVELS.find((l) => l.key === level)!;

  return (
    <PageContainer>
      <PageHeader title="30-Day Scorecard" description="วนทำแบบนี้ทุกวัน ทุกสัปดาห์ และทุกเดือน" />

      {/* 3 levels — also the tabs */}
      <div className="grid grid-cols-3 items-stretch gap-2 md:gap-3" role="tablist" aria-label="ระดับการวัดผล">
        {LEVELS.map((l, i) => {
          const on = l.key === level;
          return (
            <button
              key={l.key}
              role="tab"
              aria-selected={on}
              onClick={() => setLevel(l.key)}
              className={cn(
                "relative rounded-2xl border p-3 text-left transition-colors md:p-4",
                on ? "border-ink bg-ink text-white" : "border-line bg-card text-ink hover:border-line-strong",
              )}
            >
              <span className={cn("font-display text-[11px] tracking-wide uppercase", on ? "text-white/60" : "text-faint")}>
                {i + 1} · {l.en}
              </span>
              <span className="mt-0.5 block text-[15px] leading-tight font-semibold md:text-base">{l.verb}</span>
              <span className={cn("mt-0.5 hidden text-xs md:block", on ? "text-white/70" : "text-muted")}>{l.name}</span>
              {i < 2 && (
                <ChevronRight size={16} className="absolute top-1/2 -right-[13px] z-10 hidden -translate-y-1/2 rounded-full bg-bg text-faint md:block" />
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-4 mb-6 border-l-2 border-ink pl-3 text-[15px] leading-relaxed font-medium md:text-base">{current.question}</p>

      {level === "daily" && <DailyView />}
      {level === "weekly" && <WeeklyView />}
      {level === "monthly" && <MonthlyView />}
    </PageContainer>
  );
}

/* ------------------------------------------------------------------ */
function useDone(date: string) {
  const { getSetting } = useStore();
  return getSetting<string[]>(checklistKey(date), []);
}

function Nav({ label, sub, onPrev, onNext, onToday, showToday }: { label: string; sub?: string; onPrev: () => void; onNext: () => void; onToday: () => void; showToday: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <Button size="icon" variant="secondary" onClick={onPrev} aria-label="ก่อนหน้า">
        <ChevronLeft size={17} />
      </Button>
      <Button size="icon" variant="secondary" onClick={onNext} aria-label="ถัดไป">
        <ChevronRight size={17} />
      </Button>
      <div className="ml-1 min-w-0">
        <p className="truncate text-[15px] font-semibold">{label}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
      {showToday && (
        <Button size="sm" variant="ghost" className="ml-auto" onClick={onToday}>
          ปัจจุบัน
        </Button>
      )}
    </div>
  );
}

function Progress({ done, total, unit }: { done: number; total: number; unit: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <p className="shrink-0 font-display text-sm text-muted tabular-nums">
        <span className="text-2xl font-semibold text-ink">{done}</span>/{total} {unit}
      </p>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
        <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, children, hint }: { checked: boolean; onToggle: () => void; children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-subtle/70"
    >
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors",
          checked ? "border-ink bg-ink text-white" : "border-line-strong bg-card text-transparent",
        )}
      >
        <Check size={14} strokeWidth={3} />
      </span>
      <span className={cn("min-w-0 flex-1 text-[15px]", checked && "text-muted line-through decoration-faint")}>{children}</span>
      {hint}
    </button>
  );
}

/* ---------------------------- Daily ---------------------------- */
function DailyView() {
  const store = useStore();
  const [date, setDate] = useState(todayStr());
  const done = useDone(date);
  const toggle = (id: string) =>
    store.saveSetting(checklistKey(date), done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);

  return (
    <div>
      <Nav
        label={`${relativeDayLabel(date)} · ${fmt.long(parseDateStr(date))}`}
        onPrev={() => setDate(toDateStr(addDays(parseDateStr(date), -1)))}
        onNext={() => setDate(toDateStr(addDays(parseDateStr(date), 1)))}
        onToday={() => setDate(todayStr())}
        showToday={date !== todayStr()}
      />
      <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
        <h2 className="mb-3 text-[16px] font-semibold">PALM Daily Checklist</h2>
        <Progress done={done.length} total={DAILY_TOTAL} unit="งาน" />
        <div className="space-y-5">
          {DAILY_GROUPS.map((g) => {
            const n = g.items.filter((it) => done.includes(it.id)).length;
            return (
              <div key={g.key}>
                <p className="mb-1 flex items-center gap-2 px-2 text-[13px] font-semibold">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-subtle font-display text-[11px]">{g.key}</span>
                  {g.title}
                  <span className="ml-auto text-xs font-normal text-faint tabular-nums">
                    {n}/{g.items.length}
                  </span>
                </p>
                {g.items.map((it) => (
                  <CheckRow key={it.id} checked={done.includes(it.id)} onToggle={() => toggle(it.id)}>
                    {it.text}
                  </CheckRow>
                ))}
              </div>
            );
          })}
        </div>
        {done.length === DAILY_TOTAL && (
          <p className="mt-4 rounded-xl bg-subtle py-2.5 text-center text-[14px] font-semibold">ครบ 9 งานแล้ววันนี้ — เยี่ยมมาก</p>
        )}
      </section>

      <ThirtyDayGrid selected={date} onSelect={setDate} />
    </div>
  );
}

/** Small monochrome heat-strip of the last 30 days (darker = more of the 9 done). */
function ThirtyDayGrid({ selected, onSelect }: { selected: string; onSelect: (d: string) => void }) {
  const { getSetting } = useStore();
  const days = Array.from({ length: 30 }, (_, i) => toDateStr(addDays(new Date(), i - 29)));
  const counts = days.map((d) => getSetting<string[]>(checklistKey(d), []).length);
  const active = counts.filter((c) => c > 0).length;
  return (
    <section className="mt-5 rounded-3xl bg-card p-5 shadow-card md:p-6">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">30 วันล่าสุด</h2>
        <span className="text-xs text-muted tabular-nums">ลงมือ {active}/30 วัน</span>
      </div>
      <div className="grid grid-cols-10 gap-1.5 md:grid-cols-15">
        {days.map((d, i) => {
          const c = counts[i];
          return (
            <button
              key={d}
              onClick={() => onSelect(d)}
              title={`${fmt.short(parseDateStr(d))} · ${c}/${DAILY_TOTAL} งาน`}
              aria-label={`${fmt.short(parseDateStr(d))} ${c} จาก ${DAILY_TOTAL} งาน`}
              className={cn("aspect-square rounded-md transition-transform hover:scale-110", selected === d && "ring-2 ring-primary ring-offset-1")}
              style={{ background: c === 0 ? "var(--color-subtle)" : `rgb(21 23 28 / ${0.18 + (c / DAILY_TOTAL) * 0.82})` }}
            />
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-faint">
        น้อย
        {[0, 3, 6, 9].map((c) => (
          <span key={c} className="h-3 w-3 rounded-sm" style={{ background: c === 0 ? "var(--color-subtle)" : `rgb(21 23 28 / ${0.18 + (c / DAILY_TOTAL) * 0.82})` }} />
        ))}
        มาก · แตะช่องเพื่อดูวันนั้น
      </p>
    </section>
  );
}

/* ---------------------------- Weekly ---------------------------- */
function WeeklyView() {
  const store = useStore();
  const [monday, setMonday] = useState(() => toDateStr(startOfWeek(new Date())));
  const entry: WeeklyEntry = { ...EMPTY_WEEKLY, ...store.getSetting<Partial<WeeklyEntry>>(weeklyKey(monday), {}) };
  const save = (patch: Partial<WeeklyEntry>) => store.saveSetting(weeklyKey(monday), { ...entry, ...patch });
  const days = Array.from({ length: 7 }, (_, i) => toDateStr(addDays(parseDateStr(monday), i)));
  const dailyCount = (id: string) => days.filter((d) => store.getSetting<string[]>(checklistKey(d), []).includes(id)).length;
  const thisMonday = toDateStr(startOfWeek(new Date()));

  return (
    <div>
      <Nav
        label={`${fmt.short(parseDateStr(monday))} – ${fmt.short(addDays(parseDateStr(monday), 6))}`}
        sub={monday === thisMonday ? "สัปดาห์นี้" : undefined}
        onPrev={() => setMonday(toDateStr(addDays(parseDateStr(monday), -7)))}
        onNext={() => setMonday(toDateStr(addDays(parseDateStr(monday), 7)))}
        onToday={() => setMonday(thisMonday)}
        showToday={monday !== thisMonday}
      />
      <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
        <h2 className="mb-3 text-[16px] font-semibold">Weekly Review</h2>
        <Progress done={entry.done.length} total={WEEKLY_ITEMS.length} unit="งาน" />
        {WEEKLY_ITEMS.map((it) => {
          const n = it.fromDaily ? dailyCount(it.fromDaily) : null;
          const met = it.target ? (n ?? 0) >= it.target : null;
          return (
            <CheckRow
              key={it.id}
              checked={entry.done.includes(it.id)}
              onToggle={() => save({ done: entry.done.includes(it.id) ? entry.done.filter((x) => x !== it.id) : [...entry.done, it.id] })}
              hint={
                n !== null && (
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums", met ? "bg-ink text-white" : "bg-subtle text-muted")} title="นับจาก Daily Checklist ของสัปดาห์นี้">
                    Daily {n}/7 วัน
                  </span>
                )
              }
            >
              {it.text}
            </CheckRow>
          );
        })}
      </section>
      <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block rounded-3xl bg-card p-5 shadow-card">
          <span className="text-[15px] font-semibold">อะไรได้ผล</span>
          <AutoTextarea minRows={4} className="mt-2" value={entry.worked} onChange={(e) => save({ worked: e.target.value })} placeholder="สิ่งที่ทำแล้วเห็นผล อยากทำต่อ" />
        </label>
        <label className="block rounded-3xl bg-card p-5 shadow-card">
          <span className="text-[15px] font-semibold">อะไรต้องปรับ</span>
          <AutoTextarea minRows={4} className="mt-2" value={entry.adjust} onChange={(e) => save({ adjust: e.target.value })} placeholder="สิ่งที่ยังไม่เป็นไปตามแผน จะแก้อย่างไร" />
        </label>
      </section>
    </div>
  );
}

/* ---------------------------- Monthly ---------------------------- */
function MonthlyView() {
  const store = useStore();
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const ym = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const entry: MonthlyEntry = { ...EMPTY_MONTHLY, ...store.getSetting<Partial<MonthlyEntry>>(monthlyKey(ym), {}) };
  const save = (patch: Partial<MonthlyEntry>) => store.saveSetting(monthlyKey(ym), { ...entry, ...patch });
  const isCurrent = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();

  const stats = useMemo(() => {
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const upto = isCurrent ? now.getDate() : last;
    const days = Array.from({ length: upto }, (_, i) => toDateStr(new Date(month.getFullYear(), month.getMonth(), i + 1)));
    const lists = days.map((d) => store.getSetting<string[]>(checklistKey(d), []));
    const total = lists.reduce((n, l) => n + l.length, 0);
    const active = lists.filter((l) => l.length > 0).length;
    const groups = DAILY_GROUPS.map((g) => ({
      key: g.key,
      title: g.title,
      pct: days.length ? lists.reduce((n, l) => n + g.items.filter((it) => l.includes(it.id)).length, 0) / (days.length * g.items.length) : 0,
    }));
    const weeks = store.settings.filter((s) => s.id.startsWith("weekly:") && s.id.slice(7, 14) === ym && ((s.value as WeeklyEntry)?.done?.length ?? 0) > 0).length;
    return { days: days.length, avg: days.length ? total / (days.length * DAILY_TOTAL) : 0, active, groups, weeks };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.settings, ym]);

  return (
    <div>
      <Nav
        label={`30-Day Scorecard · ${fmt.month(month)}`}
        sub={isCurrent ? `ผ่านมาแล้ว ${stats.days} วัน` : undefined}
        onPrev={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
        onNext={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
        onToday={() => setMonth(new Date(now.getFullYear(), now.getMonth(), 1))}
        showToday={!isCurrent}
      />

      {/* auto summary from Daily / Weekly */}
      <section className="rounded-3xl bg-card p-5 shadow-card md:p-6">
        <h2 className="mb-4 text-[16px] font-semibold">สรุปจากการลงมือทำ</h2>
        <div className="grid grid-cols-3 gap-3">
          <Tile value={`${Math.round(stats.avg * 100)}%`} label="ทำ Daily เฉลี่ย" />
          <Tile value={`${stats.active}/${stats.days}`} label="วันที่ลงมือทำ" />
          <Tile value={`${stats.weeks}`} label="Weekly Review" />
        </div>
        <div className="mt-5 space-y-2.5">
          {stats.groups.map((g) => (
            <div key={g.key} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_3rem] items-center gap-3 text-[13px]">
              <span className="truncate">
                <span className="mr-1.5 font-display text-faint">{g.key}</span>
                {g.title}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-subtle">
                <span className="block h-full rounded-full bg-ink" style={{ width: `${g.pct * 100}%` }} />
              </span>
              <span className="text-right text-muted tabular-nums">{Math.round(g.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* typed numbers */}
      <section className="mt-5 rounded-3xl bg-card p-5 shadow-card md:p-6">
        <h2 className="mb-3 text-[16px] font-semibold">ตัวเลขของเดือนนี้</h2>
        <div className="grid grid-cols-3 gap-3">
          {MONTHLY_NUMBERS.map((n) => (
            <label key={n.key} className="block">
              <span className="mb-1 block text-xs text-muted">{n.label}</span>
              <TextInput
                inputMode="numeric"
                value={entry[n.key]}
                onChange={(e) => save({ [n.key]: e.target.value.replace(/[^\d,]/g, "") } as Partial<MonthlyEntry>)}
                placeholder="0"
                className="font-display text-lg tabular-nums"
              />
            </label>
          ))}
        </div>
      </section>

      {/* typed reflections */}
      <section className="mt-5 space-y-4">
        {MONTHLY_QUESTIONS.map((q) => (
          <label key={q.key} className="block rounded-3xl bg-card p-5 shadow-card">
            <span className={cn("text-[15px] font-semibold", q.key !== "next" && "text-ink")}>{q.label}</span>
            <AutoTextarea minRows={3} className="mt-2" value={entry[q.key]} onChange={(e) => save({ [q.key]: e.target.value } as Partial<MonthlyEntry>)} placeholder={q.placeholder} />
          </label>
        ))}
      </section>
    </div>
  );
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-subtle/70 p-3 md:p-4">
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
