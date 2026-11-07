"use client";

import Link from "next/link";
import { Cloud, CloudOff, Sprout } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";

export function MobileTopBar() {
  const { syncMode } = useStore();
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
          <Sprout size={15} />
        </span>
        <span className="text-[13px] font-semibold tracking-wide">SUPPERPALM</span>
        <span className="text-[13px] text-muted">Studio</span>
      </Link>
      <span className="flex items-center gap-1.5 text-[11px] text-muted">
        {syncMode === "supabase" ? <Cloud size={14} className="text-primary" /> : <CloudOff size={14} />}
        {syncMode === "supabase" ? "ซิงก์แล้ว" : "ในเครื่อง"}
      </span>
    </div>
  );
}
