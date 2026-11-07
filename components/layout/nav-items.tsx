import type { ReactElement } from "react";

type IconProps = { className?: string };

function IconOverview({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="10" width="7.5" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconCapture({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 4.5h11.5a2 2 0 0 1 2 2V19a1 1 0 0 1-1.5.87L13 18l-3 1.87L7 18l-3 1.87V6.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.5 9h8M7.5 12.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconLibrary({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 5.5a1.5 1.5 0 0 1 1.5-1.5H9a1.5 1.5 0 0 1 1.5 1.5v14a1 1 0 0 1-1.5.87L6 19l-2.5 1.37V5.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="12.5" y="4" width="7.5" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 8h3M15 11h3M15 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconReflection({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5v4.8l3.2 1.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGrowth({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 19V5M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 15.5 10 12l3 2.5 5-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type NavItem = {
  href: string;
  label: string;
  icon: (props: IconProps) => ReactElement;
};

export const navItems: NavItem[] = [
  { href: "/", label: "ภาพรวม", icon: IconOverview },
  { href: "/capture", label: "บันทึก", icon: IconCapture },
  { href: "/library", label: "คลังความรู้", icon: IconLibrary },
  { href: "/reflection", label: "ทบทวน", icon: IconReflection },
  { href: "/growth", label: "เติบโต", icon: IconGrowth },
];
