import { useId } from "react";

// Same artwork as app/icon.svg: a white diamond on the blue/sky gradient.
export default function AppLogo({ className = "h-8 w-8" }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg viewBox="0 0 512 512" className={`shrink-0 ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill={`url(#${gradientId})`} />
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M116 206 L186 126 H326 L396 206 L256 396 Z" fill="#FFFFFF" />
        <path
          d="M186 126 L221 206 L256 126 L291 206 L326 126 M221 206 L256 396 L291 206 M116 206 H396"
          fill="none"
          stroke="#BFDBFE"
          strokeWidth="8"
        />
        <path d="M116 206 L186 126 H326 L396 206 L256 396 Z" fill="none" stroke="#FFFFFF" strokeWidth="14" />
      </g>
    </svg>
  );
}
