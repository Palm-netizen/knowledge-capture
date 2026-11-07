"use client";

import { forwardRef, useLayoutEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink">
        {label}
        {hint && <span className="text-xs font-normal text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputBase =
  "w-full rounded-lg border border-line bg-card px-3 text-sm text-ink placeholder:text-faint transition-colors hover:border-line-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15";

export const TextInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function TextInput(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(inputBase, "h-10", className)} {...props} />;
});

/** Textarea that grows with its content. `bare` renders it as a Notion-like borderless block. */
export const AutoTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { bare?: boolean; minRows?: number }
>(function AutoTextarea({ className, bare, minRows = 2, value, onChange, ...props }, outerRef) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  return (
    <textarea
      ref={(el) => {
        innerRef.current = el;
        if (typeof outerRef === "function") outerRef(el);
        else if (outerRef) outerRef.current = el;
      }}
      rows={minRows}
      value={value}
      onChange={onChange}
      className={cn(
        "block w-full resize-none overflow-hidden text-sm leading-relaxed text-ink placeholder:text-faint focus:outline-none",
        bare
          ? "rounded-md bg-transparent px-2 py-1.5 -mx-2 hover:bg-subtle/70 focus:bg-subtle/70"
          : cn(inputBase, "py-2.5"),
        className,
      )}
      {...props}
    />
  );
});

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  className,
  ariaLabel,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string }[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <select
        aria-label={ariaLabel}
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || null) as T | null)}
        className={cn(inputBase, "h-10 appearance-none pr-8", !value && "text-faint")}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted" />
    </div>
  );
}

/** Pill-style single choice. Click the active chip again to clear (when allowClear). */
export function ChipGroup<T extends string>({
  value,
  onChange,
  options,
  allowClear,
  size = "md",
  className,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string }[];
  allowClear?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active && allowClear ? null : o.value)}
            className={cn(
              "rounded-full border transition-colors",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]",
              active
                ? "border-primary bg-primary-soft font-medium text-primary"
                : "border-line bg-card text-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Tabs-like segmented filter with optional counts. Scrolls horizontally on mobile. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <div className="flex shrink-0 gap-1 rounded-lg bg-subtle p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] whitespace-nowrap transition-colors",
                active ? "bg-card font-medium text-ink shadow-card" : "text-muted hover:text-ink",
              )}
            >
              {o.label}
              {o.count !== undefined && (
                <span className={cn("text-xs tabular-nums", active ? "text-primary" : "text-faint")}>{o.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
