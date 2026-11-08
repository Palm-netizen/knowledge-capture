import { THAI_MONTHS_SHORT } from "./format";

export function computeStreakDays(captureDates: string[]): number {
  const daySet = new Set(captureDates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  while (daySet.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function sumMinutes(items: { duration_minutes: number | null }[]): number {
  return items.reduce((sum, item) => sum + (item.duration_minutes ?? 0), 0);
}

// YYYY-MM-DD in local time (toISOString would shift to UTC and can land on
// the previous day in Thailand).
export function localDateIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function startOfMonthIso(date = new Date()): string {
  return localDateIso(new Date(date.getFullYear(), date.getMonth(), 1));
}

// Weeks start on Monday.
export function startOfWeek(date = new Date()): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

export type SessionStats = { count: number; minutes: number; firstAt: string | null; lastAt: string | null };

export function sessionStatsBySource(
  items: { source_id: string | null; captured_at: string; duration_minutes: number | null }[]
): Map<string, SessionStats> {
  const map = new Map<string, SessionStats>();
  items.forEach((item) => {
    if (!item.source_id) return;
    const s = map.get(item.source_id) ?? { count: 0, minutes: 0, firstAt: null, lastAt: null };
    s.count += 1;
    s.minutes += item.duration_minutes ?? 0;
    if (!s.firstAt || item.captured_at < s.firstAt) s.firstAt = item.captured_at;
    if (!s.lastAt || item.captured_at > s.lastAt) s.lastAt = item.captured_at;
    map.set(item.source_id, s);
  });
  return map;
}

export type HeatmapCell = { date: Date; count: number };

export function buildHeatmapWeeks(captureDates: string[], weeks = 12): HeatmapCell[][] {
  const counts = new Map<string, number>();
  captureDates.forEach((iso) => {
    const key = new Date(iso).toDateString();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const weeksGrid: HeatmapCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < weeks; w++) {
    const week: HeatmapCell[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cursor), count: counts.get(cursor.toDateString()) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeksGrid.push(week);
  }
  return weeksGrid;
}

const PROVENANCE_TAG_PREFIXES = ["migrated:", "orig_note:"];

export function topicBreakdown(
  items: { tags: string[] }[],
  limit = 5
): { tag: string; count: number; pct: number }[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    item.tags
      .filter((t) => !PROVENANCE_TAG_PREFIXES.some((prefix) => t.startsWith(prefix)))
      .forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([tag, count]) => ({ tag, count, pct: Math.round((count / max) * 100) }));
}

export function monthlyHoursTrend(
  items: { duration_minutes: number | null; captured_at: string }[],
  months = 6
): { label: string; minutes: number }[] {
  const now = new Date();
  const buckets: { year: number; month: number; minutes: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ year: d.getFullYear(), month: d.getMonth(), minutes: 0 });
  }
  items.forEach((item) => {
    const d = new Date(item.captured_at);
    const bucket = buckets.find((b) => b.year === d.getFullYear() && b.month === d.getMonth());
    if (bucket) bucket.minutes += item.duration_minutes ?? 0;
  });
  return buckets.map((b) => ({ label: THAI_MONTHS_SHORT[b.month], minutes: b.minutes }));
}
