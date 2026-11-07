"use client";

import Link from "next/link";
import { FileText, Lightbulb } from "lucide-react";
import type { ContentItem, Idea, Publication } from "@/lib/types";
import { PLATFORMS } from "@/lib/constants";
import { PlatformMark } from "@/components/ui/Badge";
import { scheduleLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

/**
 * Idea → Master → FB / IG / TikTok — makes the hybrid structure visible at a glance.
 */
export function RelationStrip({
  idea,
  item,
  pubs,
  activeId,
  onSelect,
}: {
  idea: Idea | undefined;
  item: ContentItem;
  pubs: Publication[];
  activeId: string | null;
  onSelect: (pubId: string) => void;
}) {
  return (
    <div className="scrollbar-none -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <div className="flex min-w-max items-center gap-2 text-xs">
        {idea && (
          <>
            <Link href="/ideas" className="flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-muted hover:text-ink" title={idea.title}>
              <Lightbulb size={13} className="text-[#D39A3A]" />
              <span className="max-w-32 truncate">{idea.title}</span>
            </Link>
            <Connector />
          </>
        )}
        <span className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary-soft px-2.5 py-1.5 font-medium text-primary">
          <FileText size={13} /> ต้นฉบับ
        </span>
        <Connector />
        <div className="flex items-center gap-1.5">
          {PLATFORMS.map((p) => {
            const pub = pubs.find((x) => x.platform === p.value);
            if (!pub) {
              return (
                <span key={p.value} className="flex items-center gap-1.5 rounded-lg border border-dashed border-line-strong px-2 py-1.5 text-faint">
                  <PlatformMark platform={p.value} size="xs" className="opacity-40" /> —
                </span>
              );
            }
            return (
              <button
                key={p.value}
                onClick={() => onSelect(pub.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border bg-card px-2 py-1.5 transition-colors",
                  activeId === pub.id ? "border-primary text-ink" : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <PlatformMark platform={p.value} size="xs" />
                <span>{pub.status === "published" ? "โพสต์แล้ว" : scheduleLabel(pub.scheduledDate, pub.scheduledTime)}</span>
              </button>
            );
          })}
        </div>
        <span className="sr-only">{item.title}</span>
      </div>
    </div>
  );
}

function Connector() {
  return <span className="h-px w-4 shrink-0 bg-line-strong" aria-hidden />;
}
