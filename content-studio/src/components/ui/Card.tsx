import { cn } from "@/lib/utils";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-xl border border-line bg-card shadow-card", className)} {...props}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  count,
  action,
  className,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
        {title}
        {count !== undefined && <span className="rounded-md bg-subtle px-1.5 text-xs font-medium text-muted">{count}</span>}
      </h2>
      {action}
    </div>
  );
}
