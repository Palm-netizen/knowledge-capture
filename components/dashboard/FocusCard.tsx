import Link from "next/link";
import type { ReactNode } from "react";

export default function FocusCard({
  title,
  icon,
  stats,
  footnote,
  href,
}: {
  title: string;
  icon: ReactNode;
  stats: { label: string; value: number }[];
  footnote: string;
  href: string;
}) {
  return (
    <Link href={href} className="block rounded-[20px] bg-panel p-6 transition-colors hover:bg-secondary">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-primary">{icon}</span>
        <h2 className="flex-1 font-display text-xl text-ink">{title}</h2>
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-muted" aria-hidden="true">
          <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-5xl text-ink">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-xs text-muted">{footnote}</p>
    </Link>
  );
}

export function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 15v-3a8 8 0 0 1 16 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <rect x="3" y="14" width="5" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <rect x="16" y="14" width="5" height="7" rx="2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
