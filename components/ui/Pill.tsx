import type { ReactNode } from "react";

type Tone = "neutral" | "good" | "warn" | "accent";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-secondary text-ink",
  good: "bg-good-tint text-good",
  warn: "bg-warn-tint text-warn",
  accent: "bg-accent-light text-primary",
};

export default function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
