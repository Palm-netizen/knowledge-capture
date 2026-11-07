import Link from "next/link";
import type { LearningSource } from "@/lib/supabase/types";
import { SOURCE_TYPE_LABEL } from "@/lib/learning-labels";

export default function SourceCard({ source }: { source: LearningSource }) {
  return (
    <Link href="/library" className="w-36 shrink-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-linear-to-br from-hero-from via-hero-via to-hero-to">
        {source.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={source.cover_url}
            alt={source.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-3xl text-primary">{source.title.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-ink">{source.title}</p>
      <p className="mt-0.5 text-xs text-muted">{SOURCE_TYPE_LABEL[source.source_type]}</p>
    </Link>
  );
}
