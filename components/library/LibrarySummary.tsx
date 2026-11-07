import { formatHours, formatThaiDate } from "@/lib/format";
import type { SessionStats } from "@/lib/stats";
import type { LearningSource } from "@/lib/supabase/types";

export default function LibrarySummary({
  title,
  sources,
  statsById,
}: {
  title: string;
  sources: LearningSource[];
  statsById: Map<string, SessionStats>;
}) {
  let learned = 0;
  let completed = 0;
  let sessions = 0;
  let minutes = 0;
  const dates: string[] = [];

  sources.forEach((s) => {
    const st = statsById.get(s.id);
    if ((st?.count ?? 0) > 0 || s.status === "completed") learned += 1;
    if (s.status === "completed") completed += 1;
    sessions += st?.count ?? 0;
    minutes += st?.minutes ?? 0;
    [st?.firstAt, st?.lastAt, s.started_at, s.finished_at].forEach((d) => {
      if (d) dates.push(d);
    });
  });

  dates.sort();
  const first = dates[0];
  const last = dates[dates.length - 1];

  const stats = [
    { label: "เรียนไปแล้ว", value: `${learned}`, unit: `จาก ${sources.length} รายการ` },
    { label: "จบแล้ว", value: `${completed}`, unit: "รายการ" },
    { label: "จำนวนครั้งที่เรียน", value: `${sessions}`, unit: "ครั้ง" },
    { label: "เวลาเรียนรวม", value: formatHours(minutes), unit: "ชั่วโมง" },
  ];

  return (
    <div className="rounded-[20px] bg-linear-to-br from-hero-from via-hero-via to-hero-to p-6">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink/70">
        {first && last
          ? `เรียนตั้งแต่ ${formatThaiDate(first, { short: true })} ถึง ${formatThaiDate(last, { short: true })}`
          : "ยังไม่มีบันทึกการเรียนในหมวดนี้"}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card/70 px-4 py-3">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 font-display text-2xl text-ink">{s.value}</p>
            <p className="text-xs text-muted">{s.unit}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
