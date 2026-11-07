import { CATEGORIES, CATEGORY_STYLE, labelOf } from "@/lib/constants";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Small category pills shown next to a day number. */
export function CategoryTags({ cats, max = 2, className }: { cats: Category[]; max?: number; className?: string }) {
  if (cats.length === 0) return null;
  const shown = cats.slice(0, max);
  const rest = cats.length - shown.length;
  const all = cats.map((c) => labelOf(CATEGORIES, c)).join(", ");
  return (
    <span className={cn("flex min-w-0 items-center gap-1 overflow-hidden", className)} title={`หมวดหมู่: ${all}`}>
      {shown.map((c) => (
        <span key={c} className={cn("truncate rounded-md px-1.5 py-px text-[10.5px] leading-4 font-medium", CATEGORY_STYLE[c].tag)}>
          {labelOf(CATEGORIES, c)}
        </span>
      ))}
      {rest > 0 && <span className="shrink-0 text-[10.5px] text-faint">+{rest}</span>}
    </span>
  );
}
