"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { SOURCE_TYPE_LABEL, SOURCE_STATUS_LABEL } from "@/lib/learning-labels";
import { updateLearningSource, deleteLearningSource } from "@/lib/supabase/mutations";
import type { LearningSource, SourceStatus } from "@/lib/supabase/types";

const STATUS_OPTIONS: SourceStatus[] = ["to_start", "in_progress", "completed"];

function statusTone(status: SourceStatus): "good" | "accent" | "neutral" {
  if (status === "completed") return "good";
  if (status === "in_progress") return "accent";
  return "neutral";
}

export default function LibraryCard({
  source,
  onUpdated,
  onDeleted,
}: {
  source: LearningSource;
  onUpdated: (s: LearningSource) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<SourceStatus>(source.status);
  const [creator, setCreator] = useState(source.creator);
  const [coverUrl, setCoverUrl] = useState(source.cover_url);
  const [saving, setSaving] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      const patch: Partial<LearningSource> = {
        status,
        creator: creator.trim(),
        cover_url: coverUrl.trim(),
      };
      if (status === "completed" && !source.finished_at) {
        patch.finished_at = new Date().toISOString().slice(0, 10);
      }
      if (status === "in_progress" && !source.started_at) {
        patch.started_at = new Date().toISOString().slice(0, 10);
      }
      const updated = await updateLearningSource(source.id, patch);
      onUpdated(updated);
      setEditing(false);
    } catch {
      setErr("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`ลบ "${source.title}" ใช่ไหม?`)) return;
    setBusyDelete(true);
    setErr(null);
    try {
      await deleteLearningSource(source.id);
      onDeleted(source.id);
    } catch {
      setErr("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
      setBusyDelete(false);
    }
  }

  return (
    <Card className="p-3">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-linear-to-br from-hero-from via-hero-via to-hero-to">
        {source.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source.cover_url}
            alt={source.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-3xl text-primary">{source.title.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink">{source.title}</p>
      <p className="mt-0.5 text-xs text-muted">{source.creator || SOURCE_TYPE_LABEL[source.source_type]}</p>
      <div className="mt-2">
        <Pill tone={statusTone(source.status)}>{SOURCE_STATUS_LABEL[source.status]}</Pill>
      </div>

      {editing ? (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SourceStatus)}
            className="w-full rounded-[8px] border border-border bg-card px-2 py-1.5 text-xs text-ink"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {SOURCE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="ผู้เขียน/ผู้พูด"
            className="w-full rounded-[8px] border border-border bg-card px-2 py-1.5 text-xs text-ink"
          />
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="ลิงก์รูปปก (ถ้ามี)"
            className="w-full rounded-[8px] border border-border bg-card px-2 py-1.5 text-xs text-ink"
          />
          {err ? <p className="text-xs text-danger">{err}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex-1 rounded-[8px] bg-primary px-2 py-1.5 text-xs text-white disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-[8px] border border-border px-2 py-1.5 text-xs text-muted"
            >
              ยกเลิก
            </button>
          </div>
          <button
            type="button"
            disabled={busyDelete}
            onClick={handleDelete}
            className="w-full text-xs text-danger hover:underline disabled:opacity-50"
          >
            {busyDelete ? "กำลังลบ..." : "ลบรายการนี้"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setEditing(true)} className="mt-2 text-xs text-primary hover:underline">
          แก้ไข
        </button>
      )}
    </Card>
  );
}
