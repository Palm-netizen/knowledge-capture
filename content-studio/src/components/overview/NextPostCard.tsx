"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Plus } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { useFeedback } from "@/components/ui/Feedback";
import { useQuickActions } from "@/components/capture/QuickActions";
import { PlatformMark } from "@/components/ui/Badge";
import { platformMeta } from "@/lib/constants";
import { scheduleLabel, todayStr } from "@/lib/date";
import { sortBySchedule } from "@/lib/selectors";
import { studioHref } from "@/lib/routes";

function untilLabel(date: string, time: string | null): string {
  const target = new Date(`${date}T${time ?? "23:59"}:00`);
  const mins = Math.round((target.getTime() - Date.now()) / 60000);
  if (mins < 0) return time ? "ถึงเวลาโพสต์แล้ว" : "วันนี้";
  if (mins < 60) return `อีก ${mins} นาที`;
  if (mins < 60 * 24) return `อีก ${Math.round(mins / 60)} ชั่วโมง`;
  return `อีก ${Math.round(mins / 1440)} วัน`;
}

/** Dark highlight card: the next scheduled post, with one-tap actions. */
export function NextPostCard() {
  const store = useStore();
  const { toast } = useFeedback();
  const { openNewContent } = useQuickActions();
  const today = todayStr();

  const next = store.publications
    .filter((p) => p.status === "scheduled" && p.scheduledDate && p.scheduledDate >= today)
    .sort(sortBySchedule)[0];
  const content = next ? store.contents.find((c) => c.id === next.contentId) : undefined;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white">
      <div className="pointer-events-none absolute -right-10 -bottom-16 h-44 w-44 rounded-full bg-orange/90" aria-hidden />
      <div className="pointer-events-none absolute -right-2 -bottom-24 h-44 w-44 rounded-full bg-primary/80 blur-[2px]" aria-hidden />

      <div className="relative">
        <p className="font-display text-lg font-medium">โพสต์ถัดไป</p>
        {next && content ? (
          <>
            <p className="mt-1 text-sm text-white/60">{scheduleLabel(next.scheduledDate, next.scheduledTime)}</p>
            <p className="mt-5 font-display text-[32px] leading-none font-semibold tracking-tight">
              {untilLabel(next.scheduledDate!, next.scheduledTime)}
            </p>
            <div className="mt-4 flex items-center gap-2.5 pr-16">
              <PlatformMark platform={next.platform} size="sm" />
              <p className="min-w-0 truncate text-[15px]">{content.title}</p>
            </div>
            <div className="mt-5 flex gap-2">
              <Link
                href={studioHref(next.contentId, next.platform)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3.5 text-sm font-medium text-ink hover:bg-white/90"
              >
                เปิดดู <ArrowUpRight size={15} />
              </Link>
              <button
                onClick={() => {
                  store.updatePublication(next.id, { status: "published" });
                  toast(`โพสต์ ${platformMeta(next.platform).label} แล้ว`, {
                    action: { label: "เลิกทำ", onClick: () => store.updatePublication(next.id, { status: "scheduled" }) },
                  });
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white/12 px-3.5 text-sm font-medium text-white hover:bg-white/20"
              >
                <Check size={15} /> โพสต์แล้ว
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-white/60">ยังไม่มีโพสต์ที่ตั้งเวลาไว้</p>
            <p className="mt-5 max-w-[15rem] text-[15px] leading-relaxed text-white/80">วางแผนโพสต์ล่วงหน้า ช่วยให้ลงคอนเทนต์ได้สม่ำเสมอ</p>
            <button
              onClick={() => openNewContent({ date: today })}
              className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-3.5 text-sm font-medium text-ink hover:bg-white/90"
            >
              <Plus size={15} /> วางโพสต์วันนี้
            </button>
          </>
        )}
      </div>
    </section>
  );
}
