// Persistence: always cache to localStorage; additionally sync to Supabase
// when NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set and
// the tables exist. Writes are debounced per row so typing in the editor
// doesn't send a request on every keystroke.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AppData } from "../types";
import { TABLES, fromRow, toRow, type Collection } from "./mappers";

const STORAGE_KEY = "supperpalm-content-studio:v1";
const EMPTY: AppData = { ideas: [], contents: [], publications: [], dailyLogs: [], settings: [] };

export type SyncMode = "local" | "supabase";
export type SyncStatus = "idle" | "saving" | "saved" | "error";

export function readLocal(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ideas: parsed.ideas ?? [],
      contents: parsed.contents ?? [],
      publications: parsed.publications ?? [],
      dailyLogs: parsed.dailyLogs ?? [],
      settings: parsed.settings ?? [],
    };
  } catch {
    return EMPTY;
  }
}

export function writeLocal(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full / private mode — Supabase (if any) still has the data */
  }
}

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

/** Newer tables: if one is missing in Supabase, that collection stays local and the rest still syncs. */
export const OPTIONAL_COLLECTIONS = ["dailyLogs", "settings"] as const;
export type OptionalCollection = (typeof OPTIONAL_COLLECTIONS)[number];

export async function loadRemote(
  sb: SupabaseClient,
): Promise<{ data: AppData; available: Record<OptionalCollection, boolean> }> {
  const [ideas, contents, pubs, logs, settings] = await Promise.all([
    sb.from(TABLES.ideas).select("*").order("created_at", { ascending: false }),
    sb.from(TABLES.contents).select("*").order("updated_at", { ascending: false }),
    sb.from(TABLES.publications).select("*").order("created_at", { ascending: true }),
    sb.from(TABLES.dailyLogs).select("*").order("date", { ascending: false }),
    sb.from(TABLES.settings).select("*"),
  ]);
  const err = ideas.error ?? contents.error ?? pubs.error;
  if (err) throw err;
  return {
    data: {
      ideas: (ideas.data ?? []).map((r) => fromRow(r)),
      contents: (contents.data ?? []).map((r) => fromRow(r)),
      publications: (pubs.data ?? []).map((r) => fromRow(r)),
      dailyLogs: logs.error ? [] : (logs.data ?? []).map((r) => fromRow(r)),
      settings: settings.error ? [] : (settings.data ?? []).map((r) => fromRow(r)),
    },
    available: { dailyLogs: !logs.error, settings: !settings.error },
  };
}

type Listener = (s: SyncStatus, message?: string) => void;

/** Debounced write queue for Supabase. */
export class RemoteSync {
  private pending = new Map<string, { collection: Collection; row: object }>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inflight = 0;

  constructor(private sb: SupabaseClient, private onStatus: Listener) {}

  upsert(collection: Collection, row: { id: string }) {
    this.pending.set(`${collection}:${row.id}`, { collection, row });
    this.onStatus("saving");
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), 700);
  }

  async remove(collection: Collection, ids: string[]) {
    if (ids.length === 0) return;
    ids.forEach((id) => this.pending.delete(`${collection}:${id}`));
    await this.run(() => this.sb.from(TABLES[collection]).delete().in("id", ids));
  }

  async flush() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const batch = [...this.pending.values()];
    this.pending.clear();
    // Parents first so foreign keys resolve.
    const order: Collection[] = ["ideas", "contents", "publications", "dailyLogs", "settings"];
    for (const c of order) {
      const rows = batch.filter((b) => b.collection === c).map((b) => toRow(b.row));
      if (rows.length) await this.run(() => this.sb.from(TABLES[c]).upsert(rows));
    }
  }

  private async run(fn: () => PromiseLike<{ error: { message: string } | null }>) {
    this.inflight++;
    this.onStatus("saving");
    try {
      const { error } = await fn();
      if (error) throw new Error(error.message);
      this.inflight--;
      if (this.inflight === 0 && this.pending.size === 0) this.onStatus("saved");
    } catch (e) {
      this.inflight--;
      this.onStatus("error", e instanceof Error ? e.message : String(e));
    }
  }
}
