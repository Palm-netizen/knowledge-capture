import Link from "next/link";
import Pill from "@/components/ui/Pill";
import SourceCover from "@/components/sources/SourceCover";
import { SOURCE_STATUS_LABEL, SOURCE_TYPE_LABEL, sessionVerb } from "@/lib/learning-labels";
import { timeAgoThai } from "@/lib/format";
import type { SessionStats } from "@/lib/stats";
import type { LearningSource, SourceStatus } from "@/lib/supabase/types";

function statusTone(status: SourceStatus): "good" | "accent" | "neutral" {
  if (status === "completed") return "good";
  if (status === "in_progress") return "accent";
  return "neutral";
}

export default function SourceRow({
  source,
  stats,
  selectMode,
  selected,
  onToggle,
}: {
  source: LearningSource;
  stats: SessionStats | undefined;
  selectMode: boolean;
  selected: boolean;
  onToggle: () => void;
}) {
  const meta = [SOURCE_TYPE_LABEL[source.source_type], source.category, source.creator].filter(Boolean).join(" · ");

  const body = (
    <>
      {selectMode ? (
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-primary bg-primary text-white" : "border-border bg-card"
          }`}
          aria-hidden="true"
        >
          {selected ? "✓" : null}
        </span>
      ) : null}
      <SourceCover source={source} className="h-16 w-12 shrink-0 rounded-lg" initialClassName="text-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{source.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted">{meta}</p>
        <p className="mt-1 text-xs text-primary">
          {stats && stats.lastAt
            ? `${sessionVerb(source.source_type)} ${stats.count} ครั้ง · ล่าสุด ${timeAgoThai(stats.lastAt)}`
            : "ยังไม่มีบันทึก"}
        </p>
      </div>
      <span className="hidden sm:inline-flex">
        <Pill tone={statusTone(source.status)}>{SOURCE_STATUS_LABEL[source.status]}</Pill>
      </span>
      {!selectMode ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-muted" aria-hidden="true">
          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </>
  );

  const rowClass = "flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition-colors";

  if (selectMode) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={selected}
        className={`${rowClass} ${selected ? "bg-accent-light" : "hover:bg-card"}`}
      >
        {body}
      </button>
    );
  }

  return (
    <Link href={`/library/item?id=${source.id}`} className={`${rowClass} hover:bg-card`}>
      {body}
    </Link>
  );
}
