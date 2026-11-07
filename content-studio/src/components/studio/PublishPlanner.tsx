"use client";

import { ArrowRight, Plus } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import type { ContentItem } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { pubsOf } from "@/lib/selectors";
import { PlatformMark, PublicationStatusBadge } from "@/components/ui/Badge";
import { TextInput } from "@/components/ui/Form";

/** Section 4: which platforms + date/time — quick scheduling without leaving the master. */
export function PublishPlanner({ item, onOpenVersion }: { item: ContentItem; onOpenVersion: (pubId: string) => void }) {
  const store = useStore();
  const pubs = pubsOf(store, item.id);

  return (
    <div className="space-y-2">
      {PLATFORMS.map((p) => {
        const pub = pubs.find((x) => x.platform === p.value);
        if (!pub) {
          return (
            <button
              key={p.value}
              onClick={() => onOpenVersion(store.addPublication(item.id, p.value).id)}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-left text-[13px] text-muted transition-colors hover:border-primary hover:text-primary"
            >
              <PlatformMark platform={p.value} className="opacity-50" />
              <span className="flex-1">เพิ่มเวอร์ชัน {p.label}</span>
              <Plus size={15} />
            </button>
          );
        }
        return (
          <div key={p.value} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-line bg-card px-3 py-2.5">
            <PlatformMark platform={p.value} />
            <span className="min-w-20 text-[13px] font-medium">{p.label}</span>
            <div className="order-last flex w-full gap-2 sm:order-none sm:w-auto">
              <TextInput
                type="date"
                aria-label={`วันเผยแพร่ ${p.label}`}
                value={pub.scheduledDate ?? ""}
                onChange={(e) => store.updatePublication(pub.id, { scheduledDate: e.target.value || null })}
                className="h-9 flex-1 sm:w-40"
              />
              <TextInput
                type="time"
                aria-label={`เวลา ${p.label}`}
                value={pub.scheduledTime ?? ""}
                onChange={(e) => store.updatePublication(pub.id, { scheduledTime: e.target.value || null })}
                className="h-9 w-28"
              />
            </div>
            <span className="ml-auto flex items-center gap-1">
              <PublicationStatusBadge status={pub.status} />
              <button onClick={() => onOpenVersion(pub.id)} className="flex h-8 items-center gap-1 rounded-md px-2 text-xs text-primary hover:bg-primary-soft">
                แก้เวอร์ชัน <ArrowRight size={13} />
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
