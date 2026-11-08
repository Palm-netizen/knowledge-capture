import { supabase } from "./supabase/client";
import { localDateIso } from "./stats";
import { splitHighlights } from "./highlights";
import { CAPTURE_KINDS, kindOf } from "./kinds";
import { SOURCE_TYPE_LABEL, NOTE_LEVEL_LABEL } from "./learning-labels";
import type { LearningNote, LearningSource } from "./supabase/types";

const TABLES = [
  "learning_sources",
  "learning_notes",
  "action_tracker",
  "reflections",
  "learning_goals",
  "weekly_plan",
] as const;

const PAGE = 1000;

// PostgREST caps a response at 1000 rows, so page through by id.
async function fetchAllRows<T>(table: string): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < PAGE) return rows;
  }
}

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Complete copy of every table, for safekeeping or restoring later.
// Photos are kept as their URLs; the image files stay in Supabase Storage.
export async function downloadFullBackup(): Promise<void> {
  const tables: Record<string, unknown[]> = {};
  for (const table of TABLES) {
    try {
      tables[table] = await fetchAllRows(table);
    } catch (err) {
      // weekly_plan may not exist on older setups; everything else must succeed.
      if (table !== "weekly_plan") throw err;
    }
  }
  const backup = {
    app: "knowledge-capture",
    version: 1,
    exported_at: new Date().toISOString(),
    tables,
  };
  download(
    `knowledge-capture-backup-${localDateIso(new Date())}.json`,
    JSON.stringify(backup, null, 2),
    "application/json"
  );
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Human-readable notes for Excel / Google Sheets.
export async function downloadNotesCsv(): Promise<void> {
  const [notes, sources] = await Promise.all([
    fetchAllRows<LearningNote>("learning_notes"),
    fetchAllRows<LearningSource>("learning_sources"),
  ]);
  const sourceById = new Map(sources.map((s) => [s.id, s]));
  const kindLabel = new Map(CAPTURE_KINDS.map((k) => [k.value, k.label]));

  const header = [
    "วันที่",
    "หมวด",
    "แหล่งความรู้",
    "ประเภท",
    "ระดับ",
    "สิ่งที่ได้เรียนรู้",
    "ความคิดที่เกิดขึ้น",
    "สิ่งที่จะนำไปใช้",
    "ข้อความที่ประทับใจ",
    "ใช้เวลา (นาที)",
    "แท็ก",
    "รูปภาพ",
  ];

  const rows = notes
    .sort((a, b) => b.captured_at.localeCompare(a.captured_at))
    .map((n) => {
      const source = n.source_id ? sourceById.get(n.source_id) : undefined;
      const kind = source ? kindOf(source) : null;
      return [
        localDateIso(new Date(n.captured_at)),
        kind ? kindLabel.get(kind) : "",
        source?.title ?? "",
        source ? SOURCE_TYPE_LABEL[source.source_type] : "",
        NOTE_LEVEL_LABEL[n.note_level] ?? n.note_level,
        n.learned,
        n.thought,
        n.will_apply,
        splitHighlights(n.highlight).join(" | "),
        n.duration_minutes ?? "",
        (n.tags ?? []).filter((t) => !t.startsWith("orig_note:") && !t.startsWith("migrated:")).join(", "),
        (n.image_urls ?? []).join(" "),
      ];
    });

  // Leading BOM so Excel opens the UTF-8 Thai text correctly.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  download(`knowledge-capture-notes-${localDateIso(new Date())}.csv`, csv, "text/csv;charset=utf-8");
}
