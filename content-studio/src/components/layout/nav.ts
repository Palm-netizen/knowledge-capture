import { CalendarDays, ChartColumn, Dna, Inbox, LayoutGrid, NotebookPen, PenLine, Target, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
  group: "main" | "plan";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", short: "ภาพรวม", icon: LayoutGrid, group: "main" },
  { href: "/goal", label: "Goal", short: "เป้าหมาย", icon: Target, group: "main" },
  { href: "/dna", label: "PALM DNA", short: "DNA", icon: Dna, group: "main" },
  { href: "/journal", label: "Daily Journal", short: "วันนี้", icon: NotebookPen, group: "main" },
  { href: "/ideas", label: "Idea Inbox", short: "ไอเดีย", icon: Inbox, group: "main" },
  { href: "/studio", label: "Content Studio", short: "สตูดิโอ", icon: PenLine, group: "main" },
  { href: "/calendar", label: "Content Calendar", short: "ปฏิทิน", icon: CalendarDays, group: "plan" },
  { href: "/performance", label: "Performance", short: "ผลงาน", icon: ChartColumn, group: "plan" },
];

export const NAV_GROUPS: { key: NavItem["group"]; label: string }[] = [
  { key: "main", label: "พื้นที่ทำงาน" },
  { key: "plan", label: "วางแผน & ผลลัพธ์" },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
