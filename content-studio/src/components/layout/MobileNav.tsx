"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis as MoreIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickActions } from "@/components/capture/QuickActions";
import { Modal } from "@/components/ui/Modal";
import { NAV_ITEMS, isActive } from "./nav";

/** Bottom tab bar (4 main tabs + "เพิ่มเติม") and the floating "บันทึกไอเดีย" button — mobile only. */
export function MobileNav() {
  const pathname = usePathname();
  const { openCapture } = useQuickActions();
  const [more, setMore] = useState(false);
  const tabs = NAV_ITEMS.filter((i) => i.mobile);
  const rest = NAV_ITEMS.filter((i) => !i.mobile);
  const moreActive = rest.some((i) => isActive(pathname, i.href));

  useEffect(() => setMore(false), [pathname]);

  return (
    <>
      <button
        onClick={() => openCapture()}
        aria-label="บันทึกไอเดีย"
        className="fixed right-4 bottom-[calc(76px+env(safe-area-inset-bottom))] z-40 flex h-14 items-center gap-2 rounded-full bg-primary pr-5 pl-4 text-[15px] font-medium text-white shadow-pop active:scale-95 md:hidden"
      >
        <Plus size={22} />
        ไอเดีย
      </button>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 backdrop-blur md:hidden">
        <div className="grid h-16 grid-cols-5">
          {tabs.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex flex-col items-center justify-center gap-1 text-[11px] whitespace-nowrap", active ? "font-medium text-primary" : "text-muted")}
              >
                <Icon size={21} strokeWidth={active ? 2.1 : 1.7} />
                {item.short}
              </Link>
            );
          })}
          <button
            onClick={() => setMore(true)}
            aria-label="เมนูเพิ่มเติม"
            className={cn("flex flex-col items-center justify-center gap-1 text-[11px]", moreActive ? "font-medium text-primary" : "text-muted")}
          >
            <MoreIcon size={21} strokeWidth={moreActive ? 2.1 : 1.7} />
            เพิ่มเติม
          </button>
        </div>
      </nav>

      <Modal open={more} onClose={() => setMore(false)} title="เมนูทั้งหมด" size="sm">
        <div className="grid grid-cols-3 gap-2 pb-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center text-[13px]",
                  active ? "border-primary bg-primary-soft font-medium text-primary" : "border-line text-ink",
                )}
              >
                <Icon size={22} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
