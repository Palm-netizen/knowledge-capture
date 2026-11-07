"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { Publication } from "@/lib/types";
import { platformMeta } from "@/lib/constants";
import { useStore } from "@/lib/store/StoreProvider";
import { cn } from "@/lib/utils";
import { studioHref } from "@/lib/routes";
import { startPostDrag } from "./dnd";
import { usePostActions } from "./usePostActions";

/**
 * Compact post block for calendar cells.
 * Click → onOpen (quick edit dialog) or the studio; drag → another day; hover × → remove from calendar.
 */
export function PostChip({ pub, compact, onOpen }: { pub: Publication; compact?: boolean; onOpen?: (id: string) => void }) {
  const { contents } = useStore();
  const actions = usePostActions();
  const content = contents.find((c) => c.id === pub.contentId);
  const meta = platformMeta(pub.platform);
  const posted = pub.status === "published";

  return (
    <div className="group/chip relative" onClick={(e) => e.stopPropagation()}>
      <Link
        href={studioHref(pub.contentId, pub.platform)}
        onClick={(e) => {
          if (onOpen) {
            e.preventDefault();
            onOpen(pub.id);
          }
        }}
        draggable={!posted}
        onDragStart={(e) => (posted ? e.preventDefault() : startPostDrag(e, pub.id))}
        title={`${meta.label} · ${content?.title ?? ""}${pub.scheduledTime ? ` · ${pub.scheduledTime}` : ""}`}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border py-1 pr-1.5 pl-1.5 text-left text-[12px] leading-tight transition-colors",
          !posted && "group-hover/chip:pr-6",
          posted
            ? "border-transparent bg-subtle text-muted"
            : "cursor-grab border-line bg-card text-ink hover:border-primary/40 active:cursor-grabbing",
        )}
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)} />
        {!compact && pub.scheduledTime && <span className="shrink-0 text-faint tabular-nums">{pub.scheduledTime}</span>}
        <span className="truncate">{content?.title ?? "—"}</span>
      </Link>
      {!posted && (
        <button
          type="button"
          onClick={() => actions.unschedule(pub)}
          aria-label={`นำ ${content?.title ?? ""} (${meta.label}) ออกจากปฏิทิน`}
          title="นำออกจากปฏิทิน"
          className="absolute top-1/2 right-1 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-faint group-hover/chip:flex hover:bg-danger-soft hover:text-danger focus:flex"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
