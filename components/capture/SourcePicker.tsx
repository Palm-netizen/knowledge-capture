"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAllSources } from "@/lib/supabase/queries";
import { createLearningSource } from "@/lib/supabase/mutations";
import { SOURCE_TYPE_LABEL } from "@/lib/learning-labels";
import { kindOf, type CAPTURE_KINDS } from "@/lib/kinds";
import type { LearningSource } from "@/lib/supabase/types";

type SelectedSource = { id: string; title: string };
type Kind = (typeof CAPTURE_KINDS)[number];

export default function SourcePicker({
  kind,
  value,
  onChange,
}: {
  kind: Kind;
  value: SelectedSource | null;
  onChange: (source: SelectedSource | null) => void;
}) {
  const [sources, setSources] = useState<LearningSource[]>([]);
  const [query, setQuery] = useState(value?.title ?? "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchAllSources()
      .then(setSources)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(value?.title ?? "");
  }, [value?.id, value?.title]);

  const ofKind = useMemo(() => sources.filter((s) => kindOf(s) === kind.value), [sources, kind.value]);

  const q = query.trim();
  const matches = useMemo(() => {
    const lower = q.toLowerCase();
    return (lower ? ofKind.filter((s) => s.title.toLowerCase().includes(lower)) : ofKind).slice(0, 8);
  }, [ofKind, q]);
  const exact = ofKind.some((s) => s.title.trim().toLowerCase() === q.toLowerCase());

  async function handleCreate() {
    if (!q) return;
    setBusy(true);
    setErr(null);
    try {
      const created = await createLearningSource({ title: q, ...kind.createAs });
      setSources((prev) => [...prev, created]);
      onChange({ id: created.id, title: created.title });
      setOpen(false);
    } catch {
      setErr("เพิ่มไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <label className="text-sm text-muted">{kind.pickerLabel}</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder={`ค้นหา${kind.pickerLabel} หรือพิมพ์ชื่อใหม่...`}
        className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="mt-1 text-xs text-muted hover:text-danger"
        >
          ล้างการเลือก
        </button>
      ) : null}
      {err ? <p className="mt-1 text-xs text-danger">{err}</p> : null}

      {open && !value ? (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {matches.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange({ id: s.id, title: s.title });
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-panel"
            >
              <span className="truncate text-ink">{s.title}</span>
              <span className="shrink-0 text-xs text-muted">{SOURCE_TYPE_LABEL[s.source_type]}</span>
            </button>
          ))}
          {q && !exact ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleCreate}
              className="w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-primary hover:bg-panel disabled:opacity-50"
            >
              {busy ? "กำลังเพิ่ม..." : `+ เพิ่ม “${q}” เป็น${kind.pickerLabel}ใหม่`}
            </button>
          ) : null}
          {!q && matches.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted">ยังไม่มี{kind.pickerLabel} พิมพ์ชื่อเพื่อเพิ่มได้เลย</p>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full border-t border-border px-3 py-1.5 text-left text-xs text-muted hover:bg-panel"
          >
            ปิด
          </button>
        </div>
      ) : null}
    </div>
  );
}
