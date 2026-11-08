"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuickActions } from "@/components/capture/QuickActions";
import { NAV_ITEMS, isActive } from "./nav";

/** Bottom tab bar + floating "บันทึกไอเดีย" button (mobile only). */
export function MobileNav() {
  const pathname = usePathname();
  const { openCapture } = useQuickActions();

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
        <div className="grid h-16 grid-cols-7">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn("flex flex-col items-center justify-center gap-1 text-[10px] whitespace-nowrap", active ? "font-medium text-primary" : "text-muted")}
              >
                <Icon size={21} strokeWidth={active ? 2.1 : 1.7} />
                {item.short}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
