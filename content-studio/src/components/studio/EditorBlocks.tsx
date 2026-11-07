"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AutoTextarea } from "@/components/ui/Form";
import { cn } from "@/lib/utils";

/** A numbered, collapsible writing section — feels like a doc heading, not a form. */
export function EditorSection({
  step,
  title,
  description,
  done,
  total,
  children,
  defaultOpen = true,
}: {
  step: number;
  title: string;
  description?: string;
  done?: number;
  total?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const complete = total !== undefined && done === total;
  return (
    <section className="border-b border-line py-6 last:border-b-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="group flex w-full items-center gap-3 text-left" aria-expanded={open}>
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
            complete ? "bg-primary text-white" : "bg-subtle text-muted",
          )}
        >
          {step}
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-semibold text-ink">{title}</span>
          {description && <span className="block text-xs text-muted">{description}</span>}
        </span>
        {total !== undefined && (
          <span className="text-xs text-faint tabular-nums">
            {done}/{total}
          </span>
        )}
        <ChevronDown size={16} className={cn("text-faint transition-transform group-hover:text-muted", !open && "-rotate-90")} />
      </button>
      {open && <div className="mt-4 space-y-4 pl-0 md:pl-9">{children}</div>}
    </section>
  );
}

/** Label + borderless auto-growing text block. */
export function WriteBlock({
  label,
  hint,
  value,
  onChange,
  placeholder,
  minRows = 1,
  large,
  counter,
  footer,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minRows?: number;
  large?: boolean;
  counter?: number;
  footer?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted">
          {label}
          {hint && <span className="ml-1.5 font-normal text-faint">· {hint}</span>}
        </span>
        {counter !== undefined && (
          <span className={cn("text-[11px] tabular-nums", value.length > counter ? "text-danger" : "text-faint")}>
            {value.length.toLocaleString()}/{counter.toLocaleString()}
          </span>
        )}
      </div>
      <AutoTextarea
        bare
        minRows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={large ? "text-[15px]! font-medium" : undefined}
      />
      {footer}
    </div>
  );
}
