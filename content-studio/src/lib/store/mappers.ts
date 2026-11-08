// camelCase (app) <-> snake_case (Supabase columns)

import type { AppData } from "../types";

export const TABLES = {
  ideas: "ideas",
  contents: "content_items",
  publications: "content_publications",
  dailyLogs: "daily_logs",
  settings: "app_settings",
} as const satisfies Record<keyof AppData, string>;

export type Collection = keyof typeof TABLES;

const toSnake = (k: string) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function toRow(obj: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[toSnake(k)] = v;
  return out;
}

export function fromRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[toCamel(k)] = v ?? (isTextColumn(k) ? "" : null);
  return out as T;
}

// Text columns are "not null default ''" in the schema, but be defensive.
function isTextColumn(k: string) {
  return [
    "details", "source_note", "objective", "audience", "pain_point", "hook", "main_message",
    "story", "takeaway", "cta", "script", "on_image_text", "caption", "hashtags",
    "learnings", "improvements", "experience", "lesson", "post_url",
  ].includes(k);
}
