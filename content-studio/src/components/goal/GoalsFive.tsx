"use client";

import { useRef, useState } from "react";
import { Check, Flag, ImagePlus, Loader2, Pencil, RotateCcw, Target } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AutoTextarea, Field, TextInput } from "@/components/ui/Form";
import { deletePhoto, savePhoto } from "@/lib/image";
import { cn } from "@/lib/utils";

export interface GoalItem {
  title: string;
  deadline: string; // YYYY-MM
  reason: string;
  image: string | null;
  done: boolean;
}

const KEY = "goals5";
const COUNT = 5;
const EMPTY: GoalItem = { title: "", deadline: "", reason: "", image: null, done: false };
const photoPath = (i: number) => `goals/goal-${i + 1}.jpg`;

const thMonth = new Intl.DateTimeFormat("th-TH", { month: "short" });
const thYear = new Intl.DateTimeFormat("th-TH", { year: "numeric" });

function normalize(v: GoalItem[] | undefined): GoalItem[] {
  return Array.from({ length: COUNT }, (_, i) => ({ ...EMPTY, ...(v?.[i] ?? {}) }));
}

/** Last day of a YYYY-MM month. */
function deadlineDate(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0);
}

function daysLeft(ym: string) {
  const end = deadlineDate(ym);
  const today = new Date();
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((end.getTime() - t.getTime()) / 86400000);
}

function monthsBetween(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const now = new Date();
  return (y - now.getFullYear()) * 12 + (m - 1 - now.getMonth());
}

/* ------------------------------------------------------------------ */
/** เป้าหมาย 5 ข้อ — each with a photo, a deadline month drawn as a line from this month, and the reason. */
export function GoalsFive() {
  const store = useStore();
  const { toast, confirm } = useFeedback();
  const goals = normalize(store.getSetting<GoalItem[]>(KEY, []));
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pending = useRef<number | null>(null);

  const save = (i: number, patch: Partial<GoalItem>) => store.saveSetting(KEY, goals.map((g, j) => (j === i ? { ...g, ...patch } : g)));

  const pickPhoto = (i: number) => {
    pending.current = i;
    fileRef.current?.click();
  };
  const onFile = async (file: File | undefined) => {
    const i = pending.current;
    if (!file || i === null) return;
    setBusy(i);
    try {
      const { url, remote } = await savePhoto(photoPath(i), file, { remote: store.syncMode === "supabase" });
      save(i, { image: url });
      toast(remote ? "ใส่รูปแล้ว" : "ใส่รูปแล้ว (เก็บไว้ในเครื่องนี้)");
    } catch (e) {
      toast(`ใส่รูปไม่สำเร็จ${e instanceof Error ? `: ${e.message}` : ""}`, { tone: "error" });
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const removePhoto = async (i: number) => {
    const ok = await confirm({ title: "ลบรูปของเป้าหมายนี้?", confirmLabel: "ลบรูป", danger: true });
    if (!ok) return;
    if (goals[i].image?.startsWith("http")) await deletePhoto(photoPath(i));
    save(i, { image: null });
  };

  const set = goals.filter((g) => g.title.trim());
  const done = set.filter((g) => g.done).length;
  const next = set
    .filter((g) => !g.done && g.deadline && daysLeft(g.deadline) >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))[0];

  return (
    <section>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">Goals & Deadlines</p>
          <h2 className="font-display text-[22px] font-semibold tracking-tight">เป้าหมาย 5 ข้อ · พร้อมเส้นตาย</h2>
        </div>
        {set.length > 0 && (
          <p className="text-[13px] text-muted">
            พิชิตแล้ว <span className="font-display font-semibold text-ink">{done}/{set.length}</span>
            {next && (
              <>
                {" · "}ใกล้ที่สุด: <span className="font-medium text-ink">{next.title}</span> อีก {daysLeft(next.deadline)} วัน
              </>
            )}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {goals.map((g, i) => (
          <GoalCard
            key={i}
            index={i}
            goal={g}
            busy={busy === i}
            onEdit={() => setEditing(i)}
            onPhoto={() => pickPhoto(i)}
            onRemovePhoto={() => removePhoto(i)}
            onToggleDone={() => {
              save(i, { done: !g.done });
              if (!g.done) toast(`พิชิตเป้าหมายข้อ ${i + 1} แล้ว 🎉`);
            }}
          />
        ))}
      </div>

      <GoalDialog index={editing} goal={editing === null ? null : goals[editing]} onClose={() => setEditing(null)} onSave={(patch) => editing !== null && save(editing, patch)} />
    </section>
  );
}

/* ------------------------------------------------------------------ */
function GoalCard({
  index,
  goal,
  busy,
  onEdit,
  onPhoto,
  onRemovePhoto,
  onToggleDone,
}: {
  index: number;
  goal: GoalItem;
  busy: boolean;
  onEdit: () => void;
  onPhoto: () => void;
  onRemovePhoto: () => void;
  onToggleDone: () => void;
}) {
  if (!goal.title.trim()) {
    return (
      <button
        onClick={onEdit}
        className="flex w-full items-center gap-4 rounded-3xl border border-dashed border-line-strong bg-card/60 p-5 text-left transition-colors hover:border-primary"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-subtle font-display text-lg font-semibold text-muted">{index + 1}</span>
        <span>
          <span className="block text-[15px] font-semibold">ตั้งเป้าหมายข้อ {index + 1}</span>
          <span className="block text-[13px] text-muted">ใส่สิ่งที่จะพิชิต เดือนที่เป็นเส้นตาย เหตุผล และรูป</span>
        </span>
      </button>
    );
  }

  return (
    <article className={cn("grid overflow-hidden rounded-3xl bg-card shadow-card md:grid-cols-[15rem_minmax(0,1fr)]", goal.done && "ring-2 ring-success/40")}>
      {/* photo */}
      <div className="group relative aspect-[16/9] bg-subtle md:aspect-auto md:min-h-[13rem]">
        {goal.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={goal.image} alt={goal.title} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <button onClick={onPhoto} className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EBF0FF] to-[#EFEBFF] text-primary">
            <Target size={34} strokeWidth={1.5} />
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-ink">
              <ImagePlus size={13} /> ใส่รูปของเป้าหมายนี้
            </span>
          </button>
        )}
        <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-xl bg-ink/80 font-display text-sm font-semibold text-white backdrop-blur">
          {index + 1}
        </span>
        {goal.image && (
          <div className="absolute top-3 right-3 flex gap-1.5 md:opacity-0 md:group-hover:opacity-100">
            <button onClick={onRemovePhoto} aria-label="ลบรูป" className="flex h-8 w-8 items-center justify-center rounded-xl bg-black/45 text-white backdrop-blur hover:bg-black/60">
              <RotateCcw size={14} />
            </button>
            <button onClick={onPhoto} className="flex h-8 items-center gap-1 rounded-xl bg-white/90 px-2.5 text-xs font-medium text-ink">
              <ImagePlus size={13} /> เปลี่ยนรูป
            </button>
          </div>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <Loader2 size={22} className="animate-spin text-primary" />
          </span>
        )}
      </div>

      {/* text + deadline */}
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className={cn("text-[18px] leading-snug font-semibold", goal.done && "text-muted line-through decoration-faint")}>{goal.title}</h3>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onToggleDone}
              aria-pressed={goal.done}
              className={cn(
                "flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-medium transition-colors",
                goal.done ? "border-success bg-success text-white" : "border-line text-muted hover:border-success hover:text-success",
              )}
            >
              <Check size={13} /> {goal.done ? "พิชิตแล้ว" : "พิชิต"}
            </button>
            <button onClick={onEdit} aria-label={`แก้ไขเป้าหมายข้อ ${index + 1}`} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted hover:bg-subtle hover:text-ink">
              <Pencil size={14} />
            </button>
          </div>
        </div>

        {goal.deadline ? (
          <DeadlineLine deadline={goal.deadline} done={goal.done} />
        ) : (
          <button onClick={onEdit} className="mt-4 text-[13px] text-primary hover:underline">
            + กำหนดเดือนที่จะพิชิต
          </button>
        )}

        {goal.reason.trim() && (
          <p className="mt-4 rounded-2xl bg-subtle/70 px-4 py-3 text-[14px] leading-relaxed">
            <span className="mr-1 font-semibold">เพราะ</span>
            {goal.reason}
          </p>
        )}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/** This month's calendar page → line with month ticks → deadline month's page with a flag. */
function DeadlineLine({ deadline, done }: { deadline: string; done: boolean }) {
  const now = new Date();
  const end = deadlineDate(deadline);
  const left = daysLeft(deadline);
  const months = monthsBetween(deadline);
  const overdue = left < 0 && !done;
  const ticks = Math.max(0, Math.min(months, 24) - 1);

  const status = done
    ? { text: "พิชิตแล้ว", cls: "bg-success text-white" }
    : overdue
      ? { text: `เลยกำหนด ${-left} วัน`, cls: "bg-danger text-white" }
      : left <= 30
        ? { text: `เหลืออีก ${left} วัน`, cls: "bg-orange text-white" }
        : { text: months > 0 ? `อีก ${months} เดือน · ${left} วัน` : `เหลืออีก ${left} วัน`, cls: "bg-ink text-white" };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <MonthPage label="เดือนนี้" date={now} tone="now" />
        <div className="relative flex-1 py-6">
          {/* the line */}
          <div className={cn("h-[3px] rounded-full", done ? "bg-success" : overdue ? "bg-danger" : "bg-gradient-to-r from-primary to-danger")} />
          {/* a tick per month in between */}
          {Array.from({ length: ticks }, (_, k) => (
            <span
              key={k}
              className="absolute top-1/2 h-2 w-[2px] -translate-y-1/2 rounded-full bg-line-strong"
              style={{ left: `${((k + 1) / (ticks + 1)) * 100}%` }}
            />
          ))}
          <span className="absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-card bg-primary" aria-hidden />
          <span className={cn("absolute top-0 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap", status.cls)}>{status.text}</span>
        </div>
        <MonthPage label="เส้นตาย" date={end} tone={done ? "done" : "deadline"} />
      </div>
    </div>
  );
}

function MonthPage({ label, date, tone }: { label: string; date: Date; tone: "now" | "deadline" | "done" }) {
  const head = tone === "now" ? "bg-primary" : tone === "done" ? "bg-success" : "bg-danger";
  return (
    <div className="flex w-[4.5rem] shrink-0 flex-col items-center">
      <div className="w-full overflow-hidden rounded-xl border border-line bg-card text-center shadow-card">
        <div className={cn("flex items-center justify-center gap-1 py-0.5 text-[10px] font-semibold text-white", head)}>
          {tone === "deadline" && <Flag size={10} />}
          {thMonth.format(date)}
        </div>
        <div className="py-1 font-display text-[13px] font-semibold tabular-nums">{thYear.format(date).replace(/\D/g, "")}</div>
      </div>
      <span className="mt-1 text-[10px] text-muted">{label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function GoalDialog({
  index,
  goal,
  onClose,
  onSave,
}: {
  index: number | null;
  goal: GoalItem | null;
  onClose: () => void;
  onSave: (patch: Partial<GoalItem>) => void;
}) {
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  // load the goal when the dialog opens
  if (index !== lastIndex) {
    setLastIndex(index);
    setTitle(goal?.title ?? "");
    setDeadline(goal?.deadline ?? "");
    setReason(goal?.reason ?? "");
  }

  if (index === null || !goal) return null;
  const now = new Date();
  const minMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const save = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), deadline, reason: reason.trim() });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`เป้าหมายข้อ ${index + 1}`}
      footer={
        <>
          {goal.title && (
            <Button
              variant="ghost"
              className="mr-auto text-danger hover:bg-danger-soft hover:text-danger"
              onClick={() => {
                onSave({ title: "", deadline: "", reason: "", done: false });
                onClose();
              }}
            >
              ล้างข้อนี้
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="primary" onClick={save} disabled={!title.trim()}>
            บันทึก
          </Button>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="เป้าหมาย">
          <TextInput autoFocus data-autofocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="เช่น พูดบนเวทีต่อหน้า 100 คน" />
        </Field>
        <Field label="จะพิชิตภายในเดือน" hint="เส้นตาย = สิ้นเดือนนั้น">
          <TextInput type="month" min={minMonth} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </Field>
        <Field label="เหตุผล" hint="ทำไมข้อนี้สำคัญกับฉัน">
          <AutoTextarea minRows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="เพราะ…" />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
