// Date helpers — dates are handled as local "YYYY-MM-DD" strings so that
// a post planned for "Monday" stays on Monday regardless of timezone.

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr(): string {
  return toDateStr(new Date());
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday-based start of week */
export function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = (x.getDay() + 6) % 7;
  return addDays(x, -diff);
}

export function isoToDateStr(iso: string): string {
  return toDateStr(new Date(iso));
}

const thDay = new Intl.DateTimeFormat("th-TH", { weekday: "short" });
const thLong = new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long" });
const thShort = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" });
const thMonth = new Intl.DateTimeFormat("th-TH", { month: "long", year: "numeric" });
const thTime = new Intl.DateTimeFormat("th-TH", { hour: "2-digit", minute: "2-digit" });

export const fmt = {
  weekday: (d: Date) => thDay.format(d),
  long: (d: Date) => thLong.format(d),
  short: (d: Date) => thShort.format(d),
  month: (d: Date) => thMonth.format(d),
  time: (d: Date) => thTime.format(d),
};

/** "วันนี้" / "เมื่อวาน" / "พรุ่งนี้" / "12 พ.ย." */
export function relativeDayLabel(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return "วันนี้";
  if (dateStr === toDateStr(addDays(new Date(), -1))) return "เมื่อวาน";
  if (dateStr === toDateStr(addDays(new Date(), 1))) return "พรุ่งนี้";
  return fmt.short(parseDateStr(dateStr));
}

export function scheduleLabel(date: string | null, time: string | null): string {
  if (!date) return "ยังไม่กำหนดวัน";
  return `${relativeDayLabel(date)}${time ? ` · ${time} น.` : ""}`;
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}
