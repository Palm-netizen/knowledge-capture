"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, CloudOff, Loader2, Plus, Sprout, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/StoreProvider";
import { useQuickActions } from "@/components/capture/QuickActions";
import { NAV_ITEMS, isActive } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  const { openCapture } = useQuickActions();
  const { ideas } = useStore();
  const newIdeas = ideas.filter((i) => i.status === "new").length;

  return (
    <aside className="sticky top-0 hidden h-dvh w-[68px] shrink-0 flex-col border-r border-line bg-card md:flex lg:w-60">
      <Link href="/" className="flex h-16 items-center gap-2.5 px-4 lg:px-5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Sprout size={17} strokeWidth={2} />
        </span>
        <span className="hidden leading-tight lg:block">
          <span className="block text-[13px] font-semibold tracking-wide">SUPPERPALM</span>
          <span className="block text-[11px] text-muted">Content Studio</span>
        </span>
      </Link>

      <div className="px-3 pb-3 lg:px-4">
        <button
          onClick={() => openCapture()}
          title="บันทึกไอเดีย (กด N)"
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white transition-colors hover:bg-primary-hover lg:justify-start lg:px-3"
        >
          <Plus size={17} />
          <span className="hidden lg:inline">บันทึกไอเดีย</span>
          <kbd className="ml-auto hidden rounded border border-white/25 px-1.5 text-[10px] font-normal text-white/80 lg:inline">N</kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 lg:px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "group flex h-10 items-center justify-center gap-3 rounded-lg px-0 text-sm transition-colors lg:justify-start lg:px-3",
                active ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-subtle hover:text-ink",
              )}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.8} />
              <span className="hidden lg:inline">{item.label}</span>
              {item.href === "/ideas" && newIdeas > 0 && (
                <span className="ml-auto hidden rounded-md bg-card px-1.5 text-xs text-muted tabular-nums lg:inline">{newIdeas}</span>
              )}
            </Link>
          );
        })}
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
    <div className="flex items-center justify-center gap-2 border-t border-line px-3 py-3 text-xs text-muted lg:justify-start lg:px-5" title={syncError ?? text}>
      {icon}
      <span className="hidden lg:inline">{text}</span>
    </div>
  );
}
