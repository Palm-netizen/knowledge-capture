"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ReflectionCard from "@/components/reflection/ReflectionCard";
import ActionTrackerItem from "@/components/reflection/ActionTrackerItem";
import { fetchAllReflections, fetchAllActionItems } from "@/lib/supabase/queries";
import { createReflection } from "@/lib/supabase/mutations";
import type { Reflection, ActionItem, ReflectionPeriod } from "@/lib/supabase/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReflectionPage() {
  const [periodType, setPeriodType] = useState<ReflectionPeriod>("weekly");
  const [periodStart, setPeriodStart] = useState(todayIso());
  const [keyLessons, setKeyLessons] = useState("");
  const [applied, setApplied] = useState("");
  const [improve, setImprove] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [reflections, setReflections] = useState<Reflection[] | null>(null);
  const [reflectionsError, setReflectionsError] = useState<string | null>(null);

  const [actions, setActions] = useState<ActionItem[] | null>(null);
  const [actionsError, setActionsError] = useState<string | null>(null);

  async function loadReflections() {
    setReflectionsError(null);
    try {
      setReflections(await fetchAllReflections());
    } catch {
      setReflectionsError("โหลดรีเฟลกชันไม่สำเร็จ");
    }
  }

  async function loadActions() {
    setActionsError(null);
    try {
      setActions(await fetchAllActionItems());
    } catch {
      setActionsError("โหลดรายการติดตามไม่สำเร็จ");
    }
  }

  useEffect(() => {
    loadReflections();
    loadActions();
  }, []);

  async function handleSubmit() {
    setSaveError(null);
    setSavedMessage(null);
    if (!keyLessons.trim() && !applied.trim() && !improve.trim() && !text.trim()) {
      setSaveError("กรอกอย่างน้อยหนึ่งช่องก่อนบันทึก");
      return;
    }
    setSaving(true);
    try {
      const created = await createReflection({
        period_type: periodType,
        period_start: periodStart,
        key_lessons: keyLessons.trim(),
        applied_summary: applied.trim(),
        improve_summary: improve.trim(),
        reflection_text: text.trim(),
      });
      setReflections((prev) => (prev ? [created, ...prev] : [created]));
      setKeyLessons("");
      setApplied("");
      setImprove("");
      setText("");
      setSavedMessage("บันทึกรีเฟลกชันแล้ว");
    } catch {
      setSaveError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  const pendingActions = (actions ?? []).filter((a) => a.status !== "done");
  const doneActions = (actions ?? []).filter((a) => a.status === "done");

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-3xl space-y-10">
      <div>
        <h1 className="font-display text-3xl text-ink">ทบทวน</h1>
        <p className="mt-1 text-muted">เปลี่ยนความรู้ให้เป็นการลงมือทำ</p>
      </div>

      <Card className="p-5 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPeriodType("daily")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              periodType === "daily" ? "bg-primary text-white" : "bg-secondary text-ink"
            }`}
          >
            รายวัน
          </button>
          <button
            type="button"
            onClick={() => setPeriodType("weekly")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              periodType === "weekly" ? "bg-primary text-white" : "bg-secondary text-ink"
            }`}
          >
            รายสัปดาห์
          </button>
          <input
            type="date"
            value={periodStart}
            onChange={(e) => setPeriodStart(e.target.value)}
            className="ml-auto rounded-[10px] border border-border bg-card px-3 py-1.5 text-sm text-ink"
          />
        </div>

        <div>
          <label className="text-sm text-muted">บทเรียนสำคัญ</label>
          <textarea
            value={keyLessons}
            onChange={(e) => setKeyLessons(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted">สิ่งที่ทำไปแล้ว</label>
          <textarea
            value={applied}
            onChange={(e) => setApplied(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted">สิ่งที่ยังต้องปรับปรุง</label>
          <textarea
            value={improve}
            onChange={(e) => setImprove(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted">สรุปสั้น ๆ (ถ้ามี)</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            className="mt-1 w-full resize-none rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-primary"
          />
        </div>

        {saveError ? <p className="text-sm text-accent">{saveError}</p> : null}
        {savedMessage ? <p className="text-sm text-primary">{savedMessage}</p> : null}

        <button
          type="button"
          disabled={saving}
          onClick={handleSubmit}
          className="w-full rounded-[10px] bg-primary px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกรีเฟลกชัน"}
        </button>
      </Card>

      <section>
        <SectionHeading title="สิ่งที่ต้องติดตาม" />
        {actionsError ? (
          <ErrorState message={actionsError} />
        ) : actions === null ? (
          <LoadingState />
        ) : pendingActions.length === 0 ? (
          <EmptyState message="ไม่มีรายการที่ต้องติดตามตอนนี้" />
        ) : (
          <Card className="px-4">
            {pendingActions.map((item) => (
              <ActionTrackerItem
                key={item.id}
                item={item}
                onUpdated={(updated) =>
                  setActions((prev) => (prev ? prev.map((a) => (a.id === updated.id ? updated : a)) : prev))
                }
                onDeleted={(id) => setActions((prev) => (prev ? prev.filter((a) => a.id !== id) : prev))}
              />
            ))}
          </Card>
        )}
        {doneActions.length > 0 ? (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs text-muted">ทำแล้ว ({doneActions.length})</summary>
            <Card className="mt-2 px-4">
              {doneActions.map((item) => (
                <ActionTrackerItem
                  key={item.id}
                  item={item}
                  onUpdated={(updated) =>
                    setActions((prev) => (prev ? prev.map((a) => (a.id === updated.id ? updated : a)) : prev))
                  }
                  onDeleted={(id) => setActions((prev) => (prev ? prev.filter((a) => a.id !== id) : prev))}
                />
              ))}
            </Card>
          </details>
        ) : null}
      </section>

      <section>
        <SectionHeading title="รีเฟลกชันที่ผ่านมา" />
        {reflectionsError ? (
          <ErrorState message={reflectionsError} />
        ) : reflections === null ? (
          <LoadingState />
        ) : reflections.length === 0 ? (
          <EmptyState message="ยังไม่มีรีเฟลกชัน เริ่มเขียนด้านบนได้เลย" />
        ) : (
          <div className="space-y-3">
            {reflections.map((r) => (
              <ReflectionCard
                key={r.id}
                reflection={r}
                onUpdated={(updated) =>
                  setReflections((prev) => (prev ? prev.map((x) => (x.id === updated.id ? updated : x)) : prev))
                }
                onDeleted={(id) => setReflections((prev) => (prev ? prev.filter((x) => x.id !== id) : prev))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
