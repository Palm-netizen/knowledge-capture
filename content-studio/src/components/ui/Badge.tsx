import { cn } from "@/lib/utils";
import { CONTENT_STATUSES, IDEA_STATUSES, PUBLICATION_STATUSES, platformMeta } from "@/lib/constants";
import type { ContentStatus, IdeaStatus, Platform, PublicationStatus } from "@/lib/types";

export type Tone = "neutral" | "green" | "amber" | "blue" | "violet";

const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-muted",
  green: "bg-primary-soft text-primary",
  amber: "bg-[#FBF3E4] text-[#94631A]",
  blue: "bg-[#EAF1FB] text-[#2F5E9E]",
  violet: "bg-[#F1EDFA] text-[#6046A8]",
};

const dots: Record<Tone, string> = {
  neutral: "bg-faint",
  green: "bg-primary",
  amber: "bg-[#D39A3A]",
  blue: "bg-[#4E82C9]",
  violet: "bg-[#7E63C4]",
};

export function Badge({ tone = "neutral", dot, className, children }: { tone?: Tone; dot?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}

export function IdeaStatusBadge({ status }: { status: IdeaStatus }) {
  const s = IDEA_STATUSES.find((x) => x.value === status)!;
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  const s = CONTENT_STATUSES.find((x) => x.value === status)!;
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function PublicationStatusBadge({ status }: { status: PublicationStatus }) {
  const s = PUBLICATION_STATUSES.find((x) => x.value === status)!;
  return <Badge tone={s.tone} dot>{s.label}</Badge>;
}

export function PlatformMark({ platform, size = "sm", className }: { platform: Platform; size?: "xs" | "sm" | "md"; className?: string }) {
  const p = platformMeta(platform);
  const sz = size === "xs" ? "h-5 min-w-5 text-[10px]" : size === "sm" ? "h-6 min-w-6 text-[11px]" : "h-8 min-w-8 text-xs";
  return (
    <span title={p.label} className={cn("inline-flex items-center justify-center rounded-md px-1 font-semibold tracking-wide", sz, p.mark, className)}>
      {p.short}
    </span>
  );
}
