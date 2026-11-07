"use client";

import { ArrowRight, Check, Pencil, PenLine, Trash2, Undo2, ImageIcon } from "lucide-react";
import { CATEGORIES, IDEA_KINDS, IDEA_SOURCES, IDEA_STATUSES, labelOf } from "@/lib/constants";
import type { Idea, IdeaStatus } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { Badge } from "@/components/ui/Badge";
import { Menu } from "@/components/ui/Menu";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/date";
import { useIdeaActions } from "./useIdeaActions";

const statusTone: Record<IdeaStatus, string> = {
  new: "border-line-strong",
  selected: "border-[#D39A3A] bg-[#D39A3A]",
  used: "border-primary bg-primary",
};

export function IdeaCard({ idea, onEdit, compact }: { idea: Idea; onEdit: (i: Idea) => void; compact?: boolean }) {
  const { updateIdea, contents } = useStore();
  const actions = useIdeaActions();
  const hasContent = contents.some((c) => c.ideaId === idea.id);
  const kindLabel = labelOf(IDEA_KINDS, idea.kind);
  const sourceLabel = [labelOf(IDEA_SOURCES, idea.source), idea.sourceNote].filter(Boolean).join(" · ");

  // Tapping the circle advances status: ยังไม่คัดเลือก → เลือกแล้ว → (back to) ยังไม่คัดเลือก
  const toggleSelect = () => updateIdea(idea.id, { status: idea.status === "new" ? "selected" : "new" });

  return (
    <div className={cn("group flex gap-3 rounded-2xl border border-transparent bg-card shadow-card transition-colors hover:border-line-strong", compact ? "p-3" : "p-4")}>
      <button
        onClick={toggleSelect}
        disabled={idea.status === "used"}
        title={idea.status === "new" ? "คัดเลือกไอเดียนี้" : idea.status === "selected" ? "ยกเลิกการคัดเลือก" : "นำไปทำแล้ว"}
        aria-label={idea.status === "new" ? "คัดเลือกไอเดียนี้" : "ยกเลิกการคัดเลือก"}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] text-white transition-colors",
          statusTone[idea.status],
          idea.status === "new" && "hover:border-primary",
        )}
      >
        {idea.status !== "new" && <Check size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <button onClick={() => onEdit(idea)} className="block w-full text-left">
          <p className={cn("text-[15px] leading-snug font-medium text-ink", idea.status === "used" && "text-muted")}>{idea.title}</p>
          {idea.details && !compact && <p className="mt-1 line-clamp-2 text-[13px] whitespace-pre-line text-muted">{idea.details}</p>}
        </button>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
          {idea.kind !== "content" && <Badge tone="violet">{kindLabel}</Badge>}
          {idea.category && <Badge>{labelOf(CATEGORIES, idea.category)}</Badge>}
          {idea.status !== "new" && <Badge tone={IDEA_STATUSES.find((s) => s.value === idea.status)!.tone}>{labelOf(IDEA_STATUSES, idea.status)}</Badge>}
          {sourceLabel && <span className="truncate">จาก {sourceLabel}</span>}
          {idea.imageUrl && (
            <a href={idea.imageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">
              <ImageIcon size={13} /> รูป
            </a>
          )}
          <span className="text-faint">· {fmt.time(new Date(idea.createdAt))} น.</span>
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-0.5">
        {idea.kind === "content" && !compact && (
          <button
            onClick={() => actions.toContent(idea)}
            className="hidden h-8 items-center gap-1 rounded-md px-2 text-[13px] text-primary hover:bg-primary-soft sm:flex"
          >
            {hasContent ? "เปิดคอนเทนต์" : "ทำคอนเทนต์"} <ArrowRight size={14} />
          </button>
        )}
        <Menu
          items={[
            { label: "แก้ไข", icon: Pencil, onSelect: () => onEdit(idea) },
            { label: hasContent ? "เปิดคอนเทนต์" : "ทำเป็นคอนเทนต์", icon: PenLine, onSelect: () => actions.toContent(idea) },
            idea.status === "used"
              ? { label: "ย้ายกลับเป็นยังไม่คัดเลือก", icon: Undo2, onSelect: () => updateIdea(idea.id, { status: "new" }) }
              : { label: "ทำเครื่องหมายว่านำไปทำแล้ว", icon: Check, onSelect: () => updateIdea(idea.id, { status: "used" }) },
            { label: "ลบ", icon: Trash2, danger: true, onSelect: () => actions.remove(idea) },
          ]}
        />
      </div>
    </div>
  );
}
