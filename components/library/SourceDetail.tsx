"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import CoverPicker from "./CoverPicker";
import TimelineEntry from "./TimelineEntry";
import MergePicker from "./MergePicker";
import { fetchAllSources, fetchNotesBySource, fetchSourceById } from "@/lib/supabase/queries";
import { createLearningNote, deleteLearningSource, updateLearningSource } from "@/lib/supabase/mutations";
import {
  SOURCE_STATUS_LABEL,
  SOURCE_TYPE_LABEL,
  collectCategories,
  sessionVerb,
} from "@/lib/learning-labels";
import { formatHours, formatThaiDate } from "@/lib/format";
import type { LearningNote, LearningSource, SourceStatus, SourceType } from "@/lib/supabase/types";

const CATEGORY_LIST_ID = "kc-detail-categories";
const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm text-ink outline-none focus:border-primary";

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Keeps the picked day but uses the current clock time, so sessions logged
// on the same day still sort in the order they were recorded.
function capturedAtFor(day: string) {
  if (day === todayIso()) return new Date().toISOString();
  const now = new Date();
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d, now.getHours(), now.getMinutes()).toISOString();
}

const wrap = "px-5 py-8 md:px-12 md:py-12 max-w-3xl";

export default function SourceDetail() {
  const id = useSearchParams().get("id");
  const router = useRouter();

  const [source, setSource] = useState<LearningSource | null>(null);
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [allSources, setAllSources] = useState<LearningSource[]>([]);
  const [merging, setMerging] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");

  const [logging, setLogging] = useState(false);
  const [logDay, setLogDay] = useState(todayIso());
  const [logMinutes, setLogMinutes] = useState("");
  const [logLearned, setLogLearned] = useState("");
  const [logThought, setLogThought] = useState("");
  const [logApply, setLogApply] = useState("");
  const [logBusy, setLogBusy] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCreator, setEditCreator] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editType, setEditType] = useState<SourceType>("book");
  const [editStatus, setEditStatus] = useState<SourceStatus>("in_progress");
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      setState("missing");
      return;
    }
    let active = true;
    Promise.all([fetchSourceById(id), fetchNotesBySource(id), fetchAllSources()])
      .then(([s, n, all]) => {
        if (!active) return;
        if (!s) {
          setState("missing");
          return;
        }
        setSource(s);
        setNotes(n);
        setAllSources(all);
        setState("ready");
      })
      .catch(() => {
        if (active) setState("error");
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (state === "loading") {
    return (
      <div className={wrap}>
        <LoadingState />
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className={wrap}>
        <ErrorState />
      </div>
    );
  }
  if (state === "missing" || !source) {
    return (
      <div className={`${wrap} space-y-4`}>
        <EmptyState message="ไม่พบรายการนี้ อาจถูกลบไปแล้ว" />
        <Link href="/library" className="text-sm font-medium text-primary hover:underline">
          ← กลับไปคลังความรู้
        </Link>
      </div>
    );
  }

  const verb = sessionVerb(source.source_type);
  const categories = collectCategories(allSources);

  async function handleMerged(merged: LearningSource, mergedIds: string[]) {
    setSource(merged);
    setAllSources((prev) => prev.filter((s) => !mergedIds.includes(s.id)));
    setMerging(false);
    setEditing(false);
    try {
      setNotes(await fetchNotesBySource(merged.id));
    } catch {
      // Merge already succeeded; the timeline will be correct on next visit.
    }
  }
  const totalMinutes = notes.reduce((sum, n) => sum + (n.duration_minutes ?? 0), 0);
  const firstAt = notes.length ? notes[notes.length - 1].captured_at : source.started_at;
  const lastAt = notes.length ? notes[0].captured_at : null;

  function startEdit() {
    if (!source) return;
    setEditTitle(source.title);
    setEditCreator(source.creator);
    setEditCategory(source.category ?? "");
    setEditType(source.source_type);
    setEditStatus(source.status);
    setEditError(null);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!source) return;
    if (!editTitle.trim()) {
      setEditError("ชื่อห้ามว่าง");
      return;
    }
    setEditBusy(true);
    setEditError(null);
    try {
      const updated = await updateLearningSource(source.id, {
        title: editTitle.trim(),
        creator: editCreator.trim(),
        category: editCategory.trim(),
        source_type: editType,
        status: editStatus,
      });
      setSource(updated);
      setEditing(false);
    } catch {
      setEditError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setEditBusy(false);
    }
  }

  async function handleDelete() {
    if (!source) return;
    if (!window.confirm(`ลบ "${source.title}" ใช่ไหม? บันทึกที่ผูกไว้จะยังอยู่แต่ไม่ผูกกับรายการนี้แล้ว`)) return;
    setEditBusy(true);
    try {
      await deleteLearningSource(source.id);
      router.push("/library");
    } catch {
      setEditError("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
      setEditBusy(false);
    }
  }

  async function handleToggleFinished() {
    if (!source) return;
    const finishing = source.status !== "completed";
    setStatusBusy(true);
    try {
      const updated = await updateLearningSource(source.id, {
        status: finishing ? "completed" : "in_progress",
        finished_at: finishing ? todayIso() : null,
      });
      setSource(updated);
    } catch {
      window.alert("อัปเดตสถานะไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleLogSession() {
    if (!source) return;
    if (!logLearned.trim() && !logThought.trim()) {
      setLogError(`เขียนสั้น ๆ ว่าได้อะไรจากการ${verb}ครั้งนี้`);
      return;
    }
    setLogBusy(true);
    setLogError(null);
    try {
      const created = await createLearningNote({
        source_id: source.id,
        note_level: logThought.trim() || logApply.trim() ? "deep" : "quick",
        captured_at: capturedAtFor(logDay),
        learned: logLearned.trim(),
        thought: logThought.trim(),
        will_apply: logApply.trim(),
        duration_minutes: logMinutes ? Number(logMinutes) : null,
      });
      setNotes((prev) => [created, ...prev].sort((a, b) => b.captured_at.localeCompare(a.captured_at)));
      if (source.status === "to_start") {
        setSource(await updateLearningSource(source.id, { status: "in_progress", started_at: logDay }));
      }
      setLogging(false);
      setLogMinutes("");
      setLogLearned("");
      setLogThought("");
      setLogApply("");
      setLogDay(todayIso());
    } catch {
      setLogError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
    } finally {
      setLogBusy(false);
    }
  }

  return (
    <div className={`${wrap} space-y-8`}>
      <datalist id={CATEGORY_LIST_ID}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <Link href="/library" className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink">
        ← คลังความรู้
      </Link>

      {/* Header */}
      <div className="flex gap-5">
        <CoverPicker source={source} onUpdated={setSource} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl text-ink sm:text-3xl">{source.title}</h1>
            <button
              type="button"
              onClick={() => (editing ? setEditing(false) : startEdit())}
              className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted hover:text-ink"
            >
              {editing ? "ปิด" : "แก้ไข"}
            </button>
          </div>
          {source.creator ? <p className="mt-1 text-sm text-muted">{source.creator}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill>{SOURCE_TYPE_LABEL[source.source_type]}</Pill>
            {source.category ? <Pill tone="accent">{source.category}</Pill> : null}
            <Pill tone={source.status === "completed" ? "good" : "neutral"}>{SOURCE_STATUS_LABEL[source.status]}</Pill>
          </div>
          {firstAt ? (
            <p className="mt-3 text-xs text-muted">เริ่ม{verb} {formatThaiDate(firstAt, { short: true })}</p>
          ) : null}
        </div>
      </div>

      {editing ? (
        <Card className="space-y-3 p-5">
          <div>
            <label className="text-sm text-muted">ชื่อ</label>
            <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-muted">ผู้เขียน / ผู้พูด</label>
              <input value={editCreator} onChange={(e) => setEditCreator(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted">หมวด</label>
              <input
                list={CATEGORY_LIST_ID}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                placeholder="เช่น N21 Mobile"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm text-muted">ประเภท</label>
              <select value={editType} onChange={(e) => setEditType(e.target.value as SourceType)} className={inputClass}>
                {(Object.keys(SOURCE_TYPE_LABEL) as SourceType[]).map((t) => (
                  <option key={t} value={t}>
                    {SOURCE_TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted">สถานะ</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SourceStatus)}
                className={inputClass}
              >
                {(Object.keys(SOURCE_STATUS_LABEL) as SourceStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {editError ? <p className="text-xs text-danger">{editError}</p> : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={editBusy}
              onClick={handleSaveEdit}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {editBusy ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMerging((v) => !v)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {merging ? "ปิดการรวม" : "รวมกับรายการอื่น"}
              </button>
              <button
                type="button"
                disabled={editBusy}
                onClick={handleDelete}
                className="text-sm text-danger hover:underline disabled:opacity-50"
              >
                ลบรายการนี้
              </button>
            </div>
          </div>
          {merging ? <MergePicker source={source} candidates={allSources} onMerged={handleMerged} /> : null}
        </Card>
      ) : null}

      {/* Progress */}
      <Card className="p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="font-display text-3xl text-ink">{notes.length}</p>
            <p className="text-xs text-muted">ครั้งที่{verb}</p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink">{formatHours(totalMinutes)}</p>
            <p className="text-xs text-muted">ชั่วโมงรวม</p>
          </div>
          <div>
            <p className="font-display text-3xl text-ink">
              {lastAt ? formatThaiDate(lastAt, { short: true }).split(" ").slice(0, 2).join(" ") : "–"}
            </p>
            <p className="text-xs text-muted">{verb}ล่าสุด</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setLogging((v) => !v)}
            className="flex-1 rounded-full bg-linear-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            + บันทึกการ{verb}ครั้งนี้
          </button>
          <button
            type="button"
            disabled={statusBusy}
            onClick={handleToggleFinished}
            className="flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-primary disabled:opacity-50"
          >
            {source.status === "completed" ? "กลับมาเรียนต่อ" : "✓ เรียนจบแล้ว"}
          </button>
        </div>
      </Card>

      {logging ? (
        <Card className="space-y-3 p-5">
          <h2 className="font-display text-lg text-ink">การ{verb}ครั้งนี้</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted">วันที่</label>
              <input type="date" value={logDay} max={todayIso()} onChange={(e) => setLogDay(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm text-muted">ใช้เวลา (นาที)</label>
              <input
                type="number"
                min={0}
                value={logMinutes}
                onChange={(e) => setLogMinutes(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-muted">ได้อะไรจากครั้งนี้</label>
            <textarea rows={3} value={logLearned} onChange={(e) => setLogLearned(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-muted">ความคิดที่เกิดขึ้น (ถ้ามี)</label>
            <textarea rows={2} value={logThought} onChange={(e) => setLogThought(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-muted">สิ่งที่จะนำไปใช้ (ถ้ามี)</label>
            <textarea rows={2} value={logApply} onChange={(e) => setLogApply(e.target.value)} className={inputClass} />
          </div>
          {logError ? <p className="text-xs text-danger">{logError}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={logBusy}
              onClick={handleLogSession}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {logBusy ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={() => setLogging(false)}
              className="rounded-full border border-border px-5 py-2 text-sm text-muted"
            >
              ยกเลิก
            </button>
          </div>
        </Card>
      ) : null}

      {/* Timeline */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl text-ink">ประวัติการ{verb}</h2>
          <span className="text-sm text-muted">{notes.length} ครั้ง</span>
        </div>
        {notes.length === 0 ? (
          <EmptyState message={`ยังไม่มีบันทึก กด "บันทึกการ${verb}ครั้งนี้" เพื่อเริ่ม`} />
        ) : (
          <ul>
            {notes.map((note, idx) => (
              <TimelineEntry
                key={note.id}
                note={note}
                verb={verb}
                isLast={idx === notes.length - 1}
                onUpdated={(n) => setNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)))}
                onDeleted={(noteId) => setNotes((prev) => prev.filter((x) => x.id !== noteId))}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
