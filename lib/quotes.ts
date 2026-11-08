import type { QuoteNote } from "./supabase/queries";
import { splitHighlights } from "./highlights";

export type Quote = { text: string; sourceId: string | null; sourceTitle: string | null };

const MAX_LENGTH = 220;

// Highlights ("ข้อความที่ประทับใจ") are the preferred reminders; short "what I
// learned" lines fill in when a note has no highlight.
export function buildQuotePool(notes: QuoteNote[]): Quote[] {
  const seen = new Set<string>();
  const pool: Quote[] = [];

  notes.forEach((n) => {
    const highlights = splitHighlights(n.highlight);
    const candidates = highlights.length ? highlights : [n.learned?.trim() ?? ""];

    candidates.forEach((text) => {
      if (!text || text.length > MAX_LENGTH || seen.has(text)) return;
      seen.add(text);
      pool.push({ text, sourceId: n.source_id, sourceTitle: n.source?.title ?? null });
    });
  });

  return pool;
}

export function randomIndex(length: number, avoid = -1): number {
  if (length <= 1) return 0;
  let i = Math.floor(Math.random() * length);
  if (i === avoid) i = (i + 1) % length;
  return i;
}
