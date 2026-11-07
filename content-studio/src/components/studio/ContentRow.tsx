"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { CATEGORIES, CONTENT_STATUSES, FORMATS, labelOf } from "@/lib/constants";
import type { ContentItem, ContentStatus } from "@/lib/types";
import { useStore } from "@/lib/store/StoreProvider";
import { contentProgress, pubsOf } from "@/lib/selectors";
import { ContentStatusBadge, PlatformMark } from "@/components/ui/Badge";
import { Menu } from "@/components/ui/Menu";
import { useFeedback } from "@/components/ui/Feedback";
import { relativeDayLabel, isoToDateStr } from "@/lib/date";
import { cn } from "@/lib/utils";
import { studioHref } from "@/lib/routes";

export function useContentActions() {
  const store = useStore();
  const { confirm, toast } = useFeedback();
  const router = useRouter();
  return {
    async remove(item: ContentItem, after?: () => void) {
      const n = store.publications.filter((p) => p.contentId === item.id).length;
      const ok = await confirm({
        title: "ลบคอนเทนต์นี้?",
        description: `“${item.title}”${n ? ` และเวอร์ชันแพลตฟอร์มทั้ง ${n} เวอร์ชัน` : ""} จะถูกลบถาวร`,
        confirmLabel: "ลบ",
        danger: true,
      });
      if (!ok) return;
      store.deleteContent(item.id);
      toast("ลบคอนเทนต์แล้ว");
      after?.();
    },
    duplicate(item: ContentItem) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = item;
      void _id; void _c; void _u;
      const copy = store.addContent({ ...rest, title: `${item.title} (สำเนา)`, status: "draft" });
      pubsOf(store, item.id).forEach((p) =>
        store.addPublication(copy.id, p.platform, { hook: p.hook, caption: p.caption, hashtags: p.hashtags, format: p.format }),
      );
      toast("ทำสำเนาแล้ว");
      router.push(studioHref(copy.id));
    },
  };
}

export function ContentRow({ item, showStatusSelect = true }: { item: ContentItem; showStatusSelect?: boolean }) {
  const store = useStore();
  const router = useRouter();
  const actions = useContentActions();
  const pubs = pubsOf(store, item.id);
  const { done, total } = contentProgress(item);
  const meta = [labelOf(CATEGORIES, item.category), labelOf(FORMATS, item.format)].filter(Boolean).join(" · ");
  const nextDate = pubs.map((p) => p.scheduledDate).filter(Boolean).sort()[0];

  return (
    <div className="group relative flex items-center gap-3 rounded-xl border border-line bg-card p-3.5 transition-colors hover:border-line-strong md:gap-4 md:p-4">
      <div className="min-w-0 flex-1">
        <Link href={studioHref(item.id)} className="block after:absolute after:inset-0 after:content-['']">
          <p className="truncate text-[15px] font-medium text-ink">{item.title}</p>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
          <ContentStatusBadge status={item.status} />
          {meta && <span>{meta}</span>}
          <span className="flex items-center gap-1.5" title={`เขียนแล้ว ${done}/${total} ส่วน`}>
            <span className="h-1 w-12 overflow-hidden rounded-full bg-subtle">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${(done / total) * 100}%` }} />
            </span>
            {done}/{total}
          </span>
          {nextDate ? <span>โพสต์ {relativeDayLabel(nextDate)}</span> : <span className="text-faint">แก้ไข {relativeDayLabel(isoToDateStr(item.updatedAt))}</span>}
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1 sm:flex">
          {pubs.length === 0 ? (
            <span className="text-xs text-faint">ยังไม่มีเวอร์ชัน</span>
          ) : (
            pubs.map((p) => (
              <span key={p.id} className={cn(p.status === "draft" && "opacity-45")} title={`${p.platform} · ${p.status}`}>
                <PlatformMark platform={p.platform} size="xs" />
              </span>
            ))
          )}
        </div>
        {showStatusSelect && (
          <select
            aria-label="เปลี่ยนสถานะ"
            value={item.status}
            onChange={(e) => store.updateContent(item.id, { status: e.target.value as ContentStatus })}
            className="hidden h-8 rounded-md border border-line bg-card px-2 text-xs text-muted hover:border-line-strong md:block"
          >
            {CONTENT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}
        <Menu
          items={[
            { label: "เปิดห้องผลิต", icon: ExternalLink, onSelect: () => router.push(studioHref(item.id)) },
            ...CONTENT_STATUSES.filter((s) => s.value !== item.status).map((s) => ({
              label: `ย้ายไป “${s.label}”`,
              onSelect: () => store.updateContent(item.id, { status: s.value }),
            })),
            { label: "ทำสำเนา", icon: Copy, onSelect: () => actions.duplicate(item) },
            { label: "ลบ", icon: Trash2, danger: true, onSelect: () => actions.remove(item) },
          ]}
        />
      </div>
    </div>
  );
}
