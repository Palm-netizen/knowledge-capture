import { useId } from "react";

const ARC = "M 20 100 A 80 80 0 0 1 180 100";

export default function GoalGauge({ pct, label }: { pct: number; label: string }) {
  // React ids contain characters that break inside url(#...), so strip them.
  const gradientId = `gauge-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="relative mx-auto w-full max-w-[240px]">
      <svg viewBox="0 0 200 110" className="w-full" role="img" aria-label={`${pct}% ${label}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <path d={ARC} fill="none" stroke="var(--color-card)" strokeWidth="16" strokeLinecap="round" />
        {pct > 0 ? (
          <path
            d={ARC}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="16"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${pct} 100`}
          />
        ) : null}
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-display text-3xl text-ink">{pct}%</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}
