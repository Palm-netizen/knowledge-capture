"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, Pencil } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { Button } from "@/components/ui/Button";
import { AutoTextarea } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

/**
 * Three editable statements saved in app_settings (e.g. ปณิธาน, คำเตือนสติ).
 * Shows an inviting empty state until the user writes them.
 */
export function PledgeList({
  settingKey,
  eyebrow,
  title,
  icon: Icon,
  placeholders,
  tone,
  emptyCta,
}: {
  settingKey: string;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  placeholders: [string, string, string];
  tone: "dark" | "light";
  emptyCta: string;
}) {
  const { getSetting, saveSetting } = useStore();
  const saved = getSetting<string[]>(settingKey, []);
  const items = saved.map((s) => s.trim()).filter(Boolean);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    if (editing) setDraft([0, 1, 2].map((i) => saved[i] ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const save = () => {
    saveSetting(settingKey, draft.map((s) => s.trim()));
    setEditing(false);
  };

  const dark = tone === "dark";

  return (
    <section className={cn("relative overflow-hidden rounded-3xl p-5 md:p-7", dark ? "bg-ink text-white" : "bg-card shadow-card")}>
      {dark && <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-orange/30 blur-3xl" aria-hidden />}
      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-2xl", dark ? "bg-orange text-white" : "bg-success-soft text-success")}>
            <Icon size={19} />
          </span>
          <div>
            <p className={cn("text-xs font-medium", dark ? "text-white/60" : "text-muted")}>{eyebrow}</p>
            <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
          </div>
        </div>
        {editing ? (
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className={dark ? "text-white/70 hover:bg-white/10 hover:text-white" : ""}>
              ยกเลิก
            </Button>
            <Button size="sm" variant="primary" onClick={save}>
              <Check size={14} /> บันทึก
            </Button>
          </div>
        ) : (
          items.length > 0 && (
            <Button
              size="sm"
              variant={dark ? "ghost" : "secondary"}
              onClick={() => setEditing(true)}
              className={dark ? "text-white/80 hover:bg-white/10 hover:text-white" : ""}
            >
              <Pencil size={13} /> แก้ไข
            </Button>
          )
        )}
      </div>

      <div className="relative mt-5">
        {editing ? (
          <div className="space-y-2.5">
            {draft.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn("mt-2.5 font-display text-lg font-semibold", dark ? "text-orange" : "text-success")}>{i + 1}</span>
                <AutoTextarea
                  minRows={1}
                  value={t}
                  onChange={(e) => setDraft((d) => d.map((x, j) => (j === i ? e.target.value : x)))}
                  placeholder={placeholders[i]}
                  aria-label={`${title} ข้อ ${i + 1}`}
                  className={dark ? "border-white/15 bg-white/10 text-white placeholder:text-white/40" : ""}
                />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <button
            onClick={() => setEditing(true)}
            className={cn(
              "flex w-full flex-col items-center gap-1 rounded-2xl border border-dashed px-4 py-6 text-center text-[14px] transition-colors",
              dark ? "border-white/25 text-white/80 hover:bg-white/5" : "border-line-strong text-muted hover:border-success hover:text-success",
            )}
          >
            <Pencil size={18} />
            {emptyCta}
          </button>
        ) : (
          <ol className="space-y-3">
            {items.map((t, i) => (
              <li key={i} className="flex gap-3.5">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-semibold",
                    dark ? "bg-white/10 text-orange" : "bg-success-soft text-success",
                  )}
                >
                  {i + 1}
                </span>
                <p className={cn("pt-0.5 text-[16px] leading-relaxed whitespace-pre-line", dark ? "text-white" : "text-ink")}>{t}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
