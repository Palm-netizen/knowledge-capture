"use client";

import Link from "next/link";
import { Cloud, CloudOff } from "lucide-react";
import { useStore } from "@/lib/store/StoreProvider";
import { DiamondMark } from "@/components/ui/Logo";

export function MobileTopBar() {
  const { syncMode } = useStore();
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-panel/90 px-4 backdrop-blur md:hidden">
      <Link href="/" className="flex items-center gap-2">
        <DiamondMark size={24} />
        <span className="font-display text-[15px] font-semibold tracking-tight">SUPPERPALM</span>
      </Link>
      <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-[11px] text-muted">
        {syncMode === "supabase" ? <Cloud size={13} className="text-primary" /> : <CloudOff size={13} />}
        {syncMode === "supabase" ? "ซิงก์แล้ว" : "ในเครื่อง"}
      </span>
    </div>
  );
}
