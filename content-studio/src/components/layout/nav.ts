import { CalendarDays, ChartColumn, Inbox, LayoutDashboard, PenLine, type LucideIcon } from "lucide-react";

export const NAV_ITEMS: { href: string; label: string; short: string; icon: LucideIcon }[] = [
  { href: "/", label: "Overview", short: "ภาพรวม", icon: LayoutDashboard },
  { href: "/ideas", label: "Idea Inbox", short: "ไอเดีย", icon: Inbox },
  { href: "/studio", label: "Content Studio", short: "สตูดิโอ", icon: PenLine },
  { href: "/calendar", label: "Content Calendar", short: "ปฏิทิน", icon: CalendarDays },
  { href: "/performance", label: "Performance", short: "ผลงาน", icon: ChartColumn },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
