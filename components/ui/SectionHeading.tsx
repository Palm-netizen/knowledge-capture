import type { ReactNode } from "react";

export default function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display text-xl text-ink">{title}</h2>
      {action}
    </div>
  );
}
