"use client";

import { useState } from "react";
import Pill from "@/components/ui/Pill";
import { ACTION_STATUS_LABEL } from "@/lib/learning-labels";
import { updateActionItem, deleteActionItem } from "@/lib/supabase/mutations";
import type { ActionItem, ActionStatus } from "@/lib/supabase/types";

const STATUS_CYCLE: ActionStatus[] = ["planned", "in_progress", "done"];

function statusTone(status: ActionStatus): "neutral" | "accent" | "good" {
  if (status === "done") return "good";
  if (status === "in_progress") return "accent";
  return "neutral";
}

export default function ActionTrackerItem({
  item,
  onUpdated,
  onDeleted,
}: {
  item: ActionItem;
  onUpdated: (item: ActionItem) => void;
  onDeleted: (id: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    setBusy(true);
    setErr(null);
    try {
      const patch: Partial<ActionItem> = { status: next };
      if (next === "done") patch.completed_at = new Date().toISOString().slice(0, 10);
      const updated = await updateActionItem(item.id, patch);
      onUpdated(updated);
    } catch {
      setErr("อัปเดตไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("ลบรายการนี้ใช่ไหม?")) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteActionItem(item.id);
      onDeleted(item.id);
    } catch {
      setErr("ลบไม่สำเร็จ");
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-0">
      <div className="min-w-0">
        <p className={`text-sm text-ink ${item.status === "done" ? "line-through text-muted" : ""}`}>
          {item.action_text}
        </p>
        {err ? <p className="text-xs text-danger">{err}</p> : null}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button type="button" disabled={busy} onClick={cycleStatus}>
          <Pill tone={statusTone(item.status)}>{ACTION_STATUS_LABEL[item.status]}</Pill>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="text-xs text-muted hover:text-danger"
        >
          ลบ
        </button>
      </div>
    </div>
  );
}
