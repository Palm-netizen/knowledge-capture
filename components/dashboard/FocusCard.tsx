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
