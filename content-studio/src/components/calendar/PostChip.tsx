"use client";

import Link from "next/link";
import type { Publication } from "@/lib/types";
import { platformMeta } from "@/lib/constants";
import { useStore } from "@/lib/store/StoreProvider";
import { cn } from "@/lib/utils";
import { studioHref } from "@/lib/routes";

/** Compact post block for calendar cells. Opens the version in the studio. */
export function PostChip({ pub, compact }: { pub: Publication; compact?: boolean }) {
  const { contents } = useStore();
  const content = contents.find((c) => c.id === pub.contentId);
  const meta = platformMeta(pub.platform);
  const posted = pub.status === "published";

  return (
    <Link
      href={studioHref(pub.contentId, pub.platform)}
      onClick={(e) => e.stopPropagation()}
      title={`${meta.label} · ${content?.title ?? ""}${pub.scheduledTime ? ` · ${pub.scheduledTime}` : ""}`}
      className={cn(
        "group flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-left text-[11.5px] leading-tight transition-colors",
        posted ? "border-transparent bg-subtle text-muted" : "border-line bg-card text-ink hover:border-line-strong",
      )}
    >
      <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)} />
      {!compact && pub.scheduledTime && <span className="shrink-0 text-faint tabular-nums">{pub.scheduledTime}</span>}
      <span className="truncate">{content?.title ?? "—"}</span>
    </Link>
  );
}
