import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong text-center",
        compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12",
        className,
      )}
    >
      <span className={cn("flex items-center justify-center rounded-full bg-primary-soft text-primary", compact ? "h-9 w-9" : "h-11 w-11")}>
        <Icon size={compact ? 17 : 20} strokeWidth={1.8} />
      </span>
      <div className="space-y-1">
        <p className={cn("font-medium text-ink", compact ? "text-sm" : "text-[15px]")}>{title}</p>
        {description && <p className="mx-auto max-w-sm text-[13px] text-muted">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
