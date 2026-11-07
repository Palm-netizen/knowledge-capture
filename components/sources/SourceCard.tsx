import Link from "next/link";
import type { LearningSource } from "@/lib/supabase/types";
import { SOURCE_TYPE_LABEL } from "@/lib/learning-labels";
import SourceCover from "./SourceCover";

export default function SourceCard({ source }: { source: LearningSource }) {
  return (
    <Link href={`/library/item?id=${source.id}`} className="w-32 shrink-0">
      <SourceCover source={source} className="aspect-[3/4] rounded-2xl" />
      <p className="mt-2 line-clamp-2 text-sm text-ink">{source.title}</p>
      <p className="mt-0.5 text-xs text-muted">{SOURCE_TYPE_LABEL[source.source_type]}</p>
    </Link>
  );
}
