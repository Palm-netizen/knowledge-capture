"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertCircle, Cloud, CloudOff, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/StoreProvider";
import { useQuickActions } from "@/components/capture/QuickActions";
import { DiamondMark, Logo } from "@/components/ui/Logo";
import { NAV_GROUPS, NAV_ITEMS, isActive } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  const { openCapture } = useQuickActions();
  const { ideas } = useStore();
  const newIdeas = ideas.filter((i) => i.status === "new").length;

  return (
    <aside className="sticky top-3 hidden h-[calc(100dvh-24px)] w-[76px] shrink-0 flex-col rounded-[28px] bg-panel md:flex lg:w-64">
      <Link href="/" className="flex h-20 items-center justify-center px-4 lg:justify-start lg:px-6">
        <span className="lg:hidden">
          <DiamondMark size={30} />
        </span>
        <span className="hidden lg:block">
          <Logo />
        </span>
      </Link>

      <div className="px-3 pb-2 lg:px-4">
        <button
          onClick={() => openCapture()}
          title="บันทึกไอเดีย (กด N)"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-medium text-white transition-colors hover:bg-[#2a2d35] lg:justify-start lg:px-4"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15">
            <Plus size={15} />
          </span>
          <span className="hidden lg:inline">บันทึกไอเดีย</span>
          <kbd className="ml-auto hidden rounded-md bg-white/15 px-1.5 text-[10px] font-normal text-white/80 lg:inline">N</kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pt-4 lg:px-4">
        {NAV_GROUPS.map((g) => (
          <div key={g.key}>
            <p className="mb-1.5 hidden px-3 text-[11px] font-medium tracking-wider text-faint uppercase lg:block">{g.label}</p>
            <div className="space-y-1">
              {NAV_ITEMS.filter((i) => i.group === g.key).map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex h-11 items-center justify-center gap-3 rounded-2xl text-[14px] transition-colors lg:justify-start lg:px-3",
                      active ? "bg-card font-medium text-ink shadow-card" : "text-muted hover:bg-card/60 hover:text-ink",
                    )}
                  >
                    <Icon size={19} strokeWidth={active ? 2.1 : 1.8} className={active ? "text-primary" : ""} />
                    <span className="hidden lg:inline">{item.label}</span>
                    {item.href === "/ideas" && newIdeas > 0 && (
                      <span className="ml-auto hidden h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1.5 text-[11px] font-medium text-white tabular-nums lg:flex">
                        {newIdeas}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <SyncIndicator />
    </aside>
  );
}

function SyncIndicator() {
  const { syncMode, syncStatus, syncError } = useStore();
  let icon = <CloudOff size={14} />;
  let text = "เก็บในเครื่องนี้";
  if (syncMode === "supabase") {
    if (syncStatus === "saving") {
      icon = <Loader2 size={14} className="animate-spin" />;
      text = "กำลังบันทึก…";
    } else if (syncStatus === "error") {
      icon = <AlertCircle size={14} className="text-danger" />;
      text = "บันทึกไม่สำเร็จ";
    } else {
      icon = <Cloud size={14} className="text-primary" />;
      text = "ซิงก์กับ Supabase";
    }
  }
  return (
    <div className="m-3 flex items-center justify-center gap-2 rounded-2xl bg-card/70 px-3 py-2.5 text-xs text-muted lg:m-4 lg:justify-start" title={syncError ?? text}>
      {icon}
      <span className="hidden lg:inline">{text}</span>
    </div>
  );
}
