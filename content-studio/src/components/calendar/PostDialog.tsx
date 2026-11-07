"use client";

import { useRouter } from "next/navigation";
import { CalendarX2, Check, PenLine, Trash2, Undo2 } from "lucide-react";
import type { Publication } from "@/lib/types";
import { CATEGORIES, platformMeta } from "@/lib/constants";
import { useStore } from "@/lib/store/StoreProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ChipGroup, Field, TextInput } from "@/components/ui/Form";
import { ContentStatusBadge, PlatformMark, PublicationStatusBadge } from "@/components/ui/Badge";
import { useFeedback } from "@/components/ui/Feedback";
import { studioHref } from "@/lib/routes";
import { usePostActions } from "./usePostActions";

/** Click a post on the calendar → quick edit: date/time, posted, open, remove, delete. */
export function PostDialog({ pubId, onClose }: { pubId: string | null; onClose: () => void }) {
  const store = useStore();
  const router = useRouter();
  const { toast } = useFeedback();
  const actions = usePostActions();

  const pub = store.publications.find((p) => p.id === pubId) ?? null;
  if (!pub) return null;
  const content = store.contents.find((c) => c.id === pub.contentId);
  const meta = platformMeta(pub.platform);
  const posted = pub.status === "published";
  const set = (patch: Partial<Publication>) => store.updatePublication(pub.id, patch);

  return (
    <Modal open={!!pub} onClose={onClose} title={content?.title ?? "โพสต์"} size="sm">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <PlatformMark platform={pub.platform} />
          <span className="text-sm font-medium">{meta.label}</span>
          <PublicationStatusBadge status={pub.status} />
          {content && <ContentStatusBadge status={content.status} />}
        </div>

        {content && (
          <div>
            <p className="mb-2 text-[13px] font-medium">หมวดหมู่</p>
            <ChipGroup
              value={content.category}
              onChange={(v) => store.updateContent(content.id, { category: v })}
              options={CATEGORIES}
              allowClear
              size="sm"
            />
          </div>
        )}

        <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-2">
          <Field label="วันที่">
            <TextInput type="date" value={pub.scheduledDate ?? ""} onChange={(e) => set({ scheduledDate: e.target.value || null })} />
          </Field>
          <Field label="เวลา">
            <TextInput type="time" value={pub.scheduledTime ?? ""} onChange={(e) => set({ scheduledTime: e.target.value || null })} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              router.push(studioHref(pub.contentId, pub.platform));
            }}
          >
            <PenLine size={15} /> เปิดเขียน
          </Button>
          {posted ? (
            <Button onClick={() => set({ status: "scheduled" })}>
              <Undo2 size={15} /> ยังไม่ได้โพสต์
            </Button>
          ) : (
            <Button
              onClick={() => {
                set({ status: "published" });
                toast(`โพสต์ ${meta.label} แล้ว`);
              }}
            >
              <Check size={15} /> โพสต์แล้ว
            </Button>
          )}
        </div>

        <div className="space-y-1 border-t border-line pt-3">
          {!posted && pub.scheduledDate && (
            <button
              onClick={() => {
                actions.unschedule(pub);
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-ink hover:bg-subtle"
            >
              <CalendarX2 size={15} className="text-muted" /> นำออกจากปฏิทิน <span className="text-xs text-faint">(เก็บเวอร์ชันไว้)</span>
            </button>
          )}
          <button
            onClick={async () => {
              if (await actions.remove(pub)) onClose();
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-danger hover:bg-danger-soft"
          >
            <Trash2 size={15} /> ลบเวอร์ชัน {meta.label}
          </button>
        </div>
      </div>
    </Modal>
  );
}
