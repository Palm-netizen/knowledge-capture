"use client";

import { useId } from "react";

/** SUPPERPALM diamond mark. */
export function DiamondMark({ size = 32, className }: { size?: number; className?: string }) {
  // unique gradient ids: several marks can be on the page (one may be display:none)
  const uid = useId().replace(/:/g, "");
  const body = `dm-body-${uid}`;
  const top = `dm-top-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={body} x1="6" y1="12" x2="22" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2F5BEA" />
          <stop offset="1" stopColor="#7B61FF" />
        </linearGradient>
        <linearGradient id={top} x1="6" y1="5" x2="26" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8EA9FF" />
          <stop offset="1" stopColor="#B3A4FF" />
        </linearGradient>
      </defs>
      <path d="M4.5 12 10 4.5h12l5.5 7.5L16 28.5 4.5 12Z" fill={`url(#${body})`} />
      <path d="M4.5 12 10 4.5h12l5.5 7.5h-23Z" fill={`url(#${top})`} />
      <path d="M10 4.5 12.6 12 16 4.5l3.4 7.5L22 4.5M4.5 12h23M12.6 12 16 28.5 19.4 12" stroke="#fff" strokeOpacity=".55" strokeWidth="1" strokeLinejoin="round" />
      <circle cx="27" cy="4.5" r="2.6" fill="#FF8A1F" />
    </svg>
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <DiamondMark size={compact ? 26 : 32} />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-[17px] font-semibold tracking-tight">SUPPERPALM</span>
          <span className="block text-[11px] text-muted">Content Studio</span>
        </span>
      )}
    </span>
  );
}
