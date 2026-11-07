"use client";

import Link from "next/link";
import { Check, Clock } from "lucide-react";
import type { Publication } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { PlatformMark, PublicationStatusBadge } from "@/components/ui/Badge";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils";
import { studioHref } from "@/lib/routes";

/** A scheduled post (one platform version) with a one-tap "โพสต์แล้ว". */
export function PostItem({ pub, showDate, dateLabel }: { pub: Publication; showDate?: boolean; dateLabel?: string }) {
  const { contents, updatePublication } = useStore();
  const { toast } = useFeedback();
  const content = contents.find((c) => c.id === pub.contentId);
  const posted = pub.status === "published";

  return (
    <div className="relative flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-subtle/70">
      <PlatformMark platform={pub.platform} />
      <div className="min-w-0 flex-1">
        <Link
          href={studioHref(pub.contentId, pub.platform)}
          className={cn("block truncate text-sm font-medium after:absolute after:inset-0 after:content-['']", posted ? "text-muted" : "text-ink")}
        >
          {content?.title ?? "(ไม่พบคอนเทนต์)"}
        </Link>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
          <Clock size={12} />
          {showDate && dateLabel ? `${dateLabel} · ` : ""}
          {pub.scheduledTime ? `${pub.scheduledTime} น.` : "ยังไม่ระบุเวลา"}
        </p>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        {posted ? (
          <PublicationStatusBadge status="published" />
        ) : (
          <button
            onClick={() => {
              updatePublication(pub.id, { status: "published" });
              toast("ทำเครื่องหมายว่าโพสต์แล้ว", {
                action: { label: "เลิกทำ", onClick: () => updatePublication(pub.id, { status: "scheduled" }) },
              });
            }}
            className="flex h-8 items-center gap-1 rounded-md border border-line bg-card px-2.5 text-xs text-muted hover:border-primary hover:text-primary"
          >
            <Check size={13} /> โพสต์แล้ว
          </button>
        )}
      </div>
    </div>
  );
}
