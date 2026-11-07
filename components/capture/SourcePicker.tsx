"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAllSourcesLite } from "@/lib/supabase/queries";
import { createLearningSource } from "@/lib/supabase/mutations";
import { SOURCE_TYPE_LABEL } from "@/lib/learning-labels";
import type { SourceType } from "@/lib/supabase/types";

type LiteSource = { id: string; title: string; source_type: SourceType };
type SelectedSource = { id: string; title: string };

const SOURCE_TYPES: SourceType[] = ["book", "podcast", "audiobook", "video", "article", "course"];

export default function SourcePicker({
  value,
  onChange,
}: {
  value: SelectedSource | null;
  onChange: (source: SelectedSource | null) => void;
}) {
  const [sources, setSources] = useState<LiteSource[]>([]);
  const [query, setQuery] = useState(value?.title ?? "");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newType, setNewType] = useState<SourceType>("book");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchAllSourcesLite()
      .then(setSources)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setQuery(value?.title ?? "");
  }, [value?.id, value?.title]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sources.slice(0, 8);
    return sources.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 8);
  }, [sources, query]);

  async function handleCreate() {
    if (!query.trim()) return;
    setBusy(true);
    try {
      const created = await createLearningSource({ title: query.trim(), source_type: newType });
      setSources((prev) => [...prev, created]);
      onChange({ id: created.id, title: created.title });
      setCreating(false);
      setOpen(false);
    } catch {
      // picker stays open so the user can retry
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <label className="text-sm text-muted">แหล่งความรู้ (ไม่บังคับ)</label>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        placeholder="ค้นหาหนังสือ / Podcast / วิดีโอ..."
        className="mt-1 w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="mt-1 text-xs text-muted hover:text-accent"
        >
          ล้างการเลือก
        </button>
      ) : null}

      {open && !value ? (
        <div className="absolute z-10 mt-1 w-full rounded-[10px] border border-border bg-card shadow-sm">
          {matches.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange({ id: s.id, title: s.title });
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-secondary/60"
            >
              <span className="text-ink">{s.title}</span>
              <span className="text-xs text-muted">{SOURCE_TYPE_LABEL[s.source_type]}</span>
            </button>
          ))}

          {query.trim() ? (
            creating ? (
              <div className="border-t border-border p-3 space-y-2">
                <p className="text-xs text-muted">
                  เพิ่ม &ldquo;{query.trim()}&rdquo; เป็นแหล่งใหม่
                </p>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as SourceType)}
                  className="w-full rounded-[8px] border border-border bg-card px-2 py-1.5 text-sm text-ink"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {SOURCE_TYPE_LABEL[t]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleCreate}
                  className="w-full rounded-[8px] bg-primary px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  {busy ? "กำลังเพิ่ม..." : "เพิ่มแหล่งนี้"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="w-full border-t border-border px-3 py-2 text-left text-sm text-primary hover:bg-secondary/60"
              >
                + เพิ่ม &ldquo;{query.trim()}&rdquo; เป็นแหล่งใหม่
              </button>
            )
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
