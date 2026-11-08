"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Flame, Heart, Pencil, Plus, Shuffle, Sparkles, X } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { Button } from "@/components/ui/Button";
import { AutoTextarea } from "@/components/ui/Form";
import { addDays, fmt, parseDateStr, relativeDayLabel, toDateStr, todayStr } from "@/lib/date";
import { cn } from "@/lib/utils";

const ADVANCE_KEY = "advance-gratitude";

export const DEFAULT_ADVANCE = [
  "ขอบคุณที่วันนี้ฉันได้ยืนบนเวที แบ่งปันสิ่งที่มีคุณค่าให้คนนับพัน",
  "ขอบคุณร่างกายที่แข็งแรง พาฉันไปทำทุกอย่างที่ตั้งใจ",
  "ขอบคุณที่ได้ไปยืนท่ามกลางภูเขาน้ำแข็งที่นิวซีแลนด์",
  "ขอบคุณทีมที่เติบโตไปด้วยกัน และเชื่อในกันและกัน",
  "ขอบคุณครอบครัวที่อบอุ่น มีความสุข และอยู่เคียงข้างกันเสมอ",
];

const three = (g: string[] | undefined | null) => {
  const a = Array.isArray(g) ? g.slice(0, 3) : [];
  while (a.length < 3) a.push("");
  return a;
};

/* ------------------------------------------------------------------ */
/** ขอบคุณล่วงหน้า — thank the future as if it already happened (editable). */
export function AdvanceGratitude() {
  const { getSetting, saveSetting } = useStore();
  const items = getSetting<string[]>(ADVANCE_KEY, DEFAULT_ADVANCE);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(items);

  useEffect(() => {
    if (!editing) setDraft(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, JSON.stringify(items)]);

  const save = () => {
    saveSetting(ADVANCE_KEY, draft.map((s) => s.trim()).filter(Boolean));
    setEditing(false);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF4E6] via-[#FFEEF4] to-[#EFEBFF] p-5 md:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-[#B65A00]">
            <Sparkles size={15} /> ขอบคุณล่วงหน้า
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight md:text-[22px]">เหมือนสิ่งที่ฝันได้เกิดขึ้นแล้ว</h2>
        </div>
        {editing ? (
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              ยกเลิก
            </Button>
            <Button size="sm" variant="primary" onClick={save}>
              <Check size={14} /> บันทึก
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={13} /> แก้ไข
          </Button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-2">
          {draft.map((t, i) => (
            <div key={i} className="flex items-start gap-2">
              <AutoTextarea
                minRows={1}
                value={t}
                onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? e.target.value : x)))}
                aria-label={`ขอบคุณล่วงหน้าข้อ ${i + 1}`}
                className="bg-white/80"
              />
              <button
                onClick={() => setDraft((d) => d.filter((_, j) => j !== i))}
                aria-label={`ลบข้อ ${i + 1}`}
                className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-danger"
              >
                <X size={15} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setDraft((d) => [...d, "ขอบคุณที่…"])}
            className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[13px] text-primary hover:bg-white/70"
          >
            <Plus size={14} /> เพิ่มข้อ
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
          {items.map((t) => (
            <li key={t} className="flex gap-3 rounded-2xl bg-white/75 px-4 py-3.5 text-[15px] leading-relaxed backdrop-blur">
              <Heart size={17} className="mt-1 shrink-0 fill-[#F2557A] text-[#F2557A]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">อ่านออกเสียงช้า ๆ แล้วนึกภาพตามทีละข้อ ให้รู้สึกว่าสิ่งนั้นเกิดขึ้นแล้วจริง ๆ</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/** Consecutive days (ending today, or yesterday if today is still empty) with at least one gratitude. */
function useGratitudeStreak() {
  const { dailyLogs } = useStore();
  return useMemo(() => {
    const has = new Set(dailyLogs.filter((l) => three(l.gratitude).some((g) => g.trim())).map((l) => l.date));
    let d = new Date();
    if (!has.has(toDateStr(d))) d = addDays(d, -1);
    let n = 0;
    while (has.has(toDateStr(d))) {
      n++;
      d = addDays(d, -1);
    }
    return { streak: n, total: has.size };
  }, [dailyLogs]);
}

/** วันนี้ฉันขอบคุณ… — 3 things, per day. Used on Goal and Daily Journal. */
export function GratitudeToday({ date = todayStr(), compact }: { date?: string; compact?: boolean }) {
  const store = useStore();
  const log = store.dailyLogs.find((l) => l.date === date);
  const items = three(log?.gratitude);
  const { streak } = useGratitudeStreak();
  const filled = items.filter((g) => g.trim()).length;

  const set = (i: number, v: string) => store.saveDailyLog(date, { gratitude: items.map((g, j) => (j === i ? v : g)) });

  return (
    <section className={cn("rounded-3xl bg-card shadow-card", compact ? "p-5" : "p-5 md:p-7")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[16px] font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2557A] text-white">
            <Heart size={18} />
          </span>
          {date === todayStr() ? "วันนี้ฉันขอบคุณ…" : `${relativeDayLabel(date)} ฉันขอบคุณ…`}
        </h2>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            streak > 0 ? "bg-orange-soft text-[#B65A00]" : "bg-subtle text-muted",
          )}
          title="จำนวนวันติดต่อกันที่บันทึกการขอบคุณ"
        >
          <Flame size={14} className={streak > 0 ? "text-orange" : ""} />
          ขอบคุณติดต่อกัน <span className="font-display tabular-nums">{streak}</span> วัน
        </span>
      </div>
      <ol className="space-y-2">
        {items.map((g, i) => (
          <li key={i} className="flex items-center gap-3 rounded-2xl border border-line px-3 focus-within:border-[#F2557A]">
            <span className="w-4 shrink-0 text-center font-display text-sm text-faint">{i + 1}</span>
            <input
              value={g}
              onChange={(e) => set(i, e.target.value)}
              placeholder={["ขอบคุณ…ที่ทำให้วันนี้ดีขึ้น", "ขอบคุณตัวเองที่…", "ขอบคุณเรื่องเล็ก ๆ ที่…"][i]}
              aria-label={`ขอบคุณข้อ ${i + 1}`}
              className="h-11 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-faint focus:outline-none"
            />
            {g.trim() && <Heart size={15} className="shrink-0 fill-[#F2557A] text-[#F2557A]" />}
          </li>
        ))}
      </ol>
      {filled === 3 && (
        <p className="mt-3 rounded-2xl bg-[#FFEEF4] py-2.5 text-center text-[13px] font-medium text-[#C2336A]">ครบ 3 ข้อแล้ว ใจที่ขอบคุณคือใจที่ดึงดูดสิ่งดี ๆ 💗</p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/** A random gratitude from past days — something to re-read on low-energy days. */
export function GratitudeRecall() {
  const { dailyLogs } = useStore();
  const today = todayStr();
  const past = useMemo(
    () =>
      dailyLogs
        .filter((l) => l.date < today)
        .flatMap((l) => three(l.gratitude).filter((g) => g.trim()).map((text) => ({ text, date: l.date }))),
    [dailyLogs, today],
  );
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (past.length) setIndex(Math.floor(Math.random() * past.length));
  }, [past.length]);

  if (past.length === 0) return null;
  const item = past[index % past.length];

  return (
    <section className="flex items-center gap-4 rounded-3xl bg-ink p-5 text-white md:p-6">
      <Heart size={22} className="shrink-0 fill-[#F2557A] text-[#F2557A]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-white/60">
          เคยขอบคุณไว้เมื่อ {relativeDayLabel(item.date)} · {fmt.weekday(parseDateStr(item.date))}
        </p>
        <p className="mt-1 text-[16px] leading-relaxed">“{item.text}”</p>
      </div>
      {past.length > 1 && (
        <button
          onClick={() => setIndex((i) => (i + 1 + Math.floor(Math.random() * (past.length - 1))) % past.length)}
          aria-label="สุ่มข้อขอบคุณอื่น"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20"
        >
          <Shuffle size={16} />
        </button>
      )}
    </section>
  );
}
