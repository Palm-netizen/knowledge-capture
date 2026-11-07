"use client";

import { useState } from "react";
import type { LearningSource } from "@/lib/supabase/types";

export default function SourceCover({
  source,
  className = "",
  initialClassName = "text-3xl",
}: {
  source: Pick<LearningSource, "title" | "cover_url">;
  className?: string;
  initialClassName?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = source.cover_url && source.cover_url !== failedUrl;

  return (
    <div
      className={`relative overflow-hidden bg-linear-to-br from-hero-from via-hero-via to-hero-to ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.cover_url}
          alt={source.title}
          loading="lazy"
          onError={() => setFailedUrl(source.cover_url)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className={`font-display text-primary ${initialClassName}`}>{source.title.slice(0, 1)}</span>
        </div>
      )}
    </div>
  );
}
