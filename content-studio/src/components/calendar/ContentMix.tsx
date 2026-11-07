"use client";

import { CATEGORIES, CATEGORY_STYLE } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export type CategoryFilter = Category | "none" | null;

/**
 * สัดส่วนเนื้อหา — how the contents planned in the visible period split across categories.
 * Click a category to show only its posts on the calendar.
 */
export function ContentMix({
  counts,
  none,
  periodLabel,
  filter,
  onFilter,
}: {
  counts: Record<Category, number>;
  none: number;
  periodLabel: string;
  filter: CategoryFilter;
  onFilter: (f: CategoryFilter) => void;
}) {
  const total = CATEGORIES.reduce((n, c) => n + counts[c.value], 0) + none;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section className="mb-4 rounded-3xl bg-card p-4 shadow-card md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-semibold">
          สัดส่วนเนื้อหา<span className="ml-2 text-xs font-normal text-muted">{periodLabel} · {total} คอนเทนต์</span>
        </h2>
        {filter && (
          <button onClick={() => onFilter(null)} className="text-xs text-primary hover:underline">
            แสดงทุกหมวด
          </button>
        )}
      </div>

      {total === 0 ? (
        <p className="mt-2 text-[13px] text-muted">ยังไม่มีคอนเทนต์ในช่วงนี้ — คลิกวันในปฏิทินเพื่อเริ่มวางแผน</p>
      ) : (
        <>
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-subtle" aria-hidden>
            {CATEGORIES.map((c) =>
              counts[c.value] ? (
                <div key={c.value} className={cn(CATEGORY_STYLE[c.value].bar, filter && filter !== c.value && "opacity-25")} style={{ flex: counts[c.value] }} />
              ) : null,
            )}
            {none > 0 && <div className={cn("bg-line-strong", filter && filter !== "none" && "opacity-25")} style={{ flex: none }} />}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => {
              const n = counts[c.value];
              const active = filter === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => onFilter(active ? null : c.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    active ? "border-ink bg-ink text-white" : "border-line bg-card text-ink hover:border-line-strong",
                    n === 0 && !active && "text-faint",
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", CATEGORY_STYLE[c.value].bar)} />
                  {c.label}
                  <span className={cn("tabular-nums", active ? "text-white/70" : "text-muted")}>
                    {n} · {pct(n)}%
                  </span>
                </button>
              );
            })}
            {none > 0 && (
              <button
                onClick={() => onFilter(filter === "none" ? null : "none")}
                aria-pressed={filter === "none"}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  filter === "none" ? "border-ink bg-ink text-white" : "border-dashed border-line-strong text-muted hover:text-ink",
                )}
                title="คลิกโพสต์เพื่อกำหนดหมวดหมู่"
              >
                ยังไม่ระบุหมวด
                <span className="tabular-nums">{none}</span>
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
