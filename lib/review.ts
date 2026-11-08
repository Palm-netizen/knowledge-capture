import { localDateIso } from "./stats";

export const DAILY_REVIEW_COUNT = 3;

// Each period is a small window of days rather than one exact day, so it
// still finds something when you don't log every single day.
export const REVIEW_PERIODS = [
  { key: "1d", label: "เมื่อวาน", from: 1, to: 1 },
  { key: "1w", label: "1 สัปดาห์ก่อน", from: 6, to: 8 },
  { key: "1m", label: "1 เดือนก่อน", from: 27, to: 33 },
  { key: "3m", label: "3 เดือนก่อน", from: 85, to: 95 },
  { key: "1y", label: "1 ปีก่อน", from: 358, to: 372 },
] as const;

export type ReviewPeriodKey = (typeof REVIEW_PERIODS)[number]["key"];

type ReviewableNote = {
  id: string;
  captured_at: string;
  learned: string | null;
  highlight: string | null;
  thought: string | null;
};

export type AgedNote<T> = { note: T; daysAgo: number };

// Day number from local calendar fields, so "yesterday" follows the
// user's clock rather than UTC.
export function dayNumber(d: Date): number {
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000;
}

// Notes from before today that have something to read, with their age.
export function pastNotes<T extends ReviewableNote>(notes: T[], today = new Date()): AgedNote<T>[] {
  const todayNumber = dayNumber(today);
  return notes
    .filter((n) => n.learned?.trim() || n.highlight?.trim() || n.thought?.trim())
    .map((note) => ({ note, daysAgo: todayNumber - dayNumber(new Date(note.captured_at)) }))
    .filter((x) => x.daysAgo >= 1);
}

export function inPeriod(daysAgo: number, key: ReviewPeriodKey): boolean {
  const p = REVIEW_PERIODS.find((x) => x.key === key);
  return !!p && daysAgo >= p.from && daysAgo <= p.to;
}

// FNV-1a: a small stable hash, so the "random" daily order is the same on
// every device and every reload for a given day.
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Today's set: notes due at a spaced-repetition interval first, then the
// rest, each group shuffled by a hash of (date, note id). Changes daily.
export function dailyReviewSet<T extends ReviewableNote>(
  aged: AgedNote<T>[],
  today = new Date(),
  count = DAILY_REVIEW_COUNT
): AgedNote<T>[] {
  const day = localDateIso(today);
  const byHash = (a: AgedNote<T>, b: AgedNote<T>) => hash(day + a.note.id) - hash(day + b.note.id);
  const due = aged.filter((x) => REVIEW_PERIODS.some((p) => inPeriod(x.daysAgo, p.key))).sort(byHash);
  const rest = aged.filter((x) => !due.includes(x)).sort(byHash);
  return [...due, ...rest].slice(0, count);
}

const REVIEWED_PREFIX = "kc-reviewed-";

export function readReviewed(today = new Date()): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(REVIEWED_PREFIX + localDateIso(today)) ?? "[]"));
  } catch {
    return new Set();
  }
}

export function writeReviewed(ids: Set<string>, today = new Date()): void {
  const key = REVIEWED_PREFIX + localDateIso(today);
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
    // Drop earlier days' progress so old keys don't pile up.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(REVIEWED_PREFIX) && k !== key) localStorage.removeItem(k);
    }
  } catch {
    // Storage unavailable — progress just won't survive a reload.
  }
}
