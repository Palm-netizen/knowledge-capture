import type { ReactNode } from "react";

type Tone = "neutral" | "good" | "warn" | "accent";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-secondary text-ink",
  good: "bg-good-tint text-primary",
  warn: "bg-warn-tint text-accent",
  accent: "bg-accent-light text-accent",
};

export default function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs whitespace-nowrap ${TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
