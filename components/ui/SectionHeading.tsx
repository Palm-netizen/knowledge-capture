import type { ReactNode } from "react";

export default function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      {action}
    </div>
  );
}
