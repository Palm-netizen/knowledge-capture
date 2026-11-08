import type { ReactNode } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import ThemeToggle from "./ThemeToggle";
import { MobileAccountMenu } from "./AccountMenu";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="flex items-center justify-between px-5 pt-4 md:hidden">
          <Link href="/" className="font-display text-lg font-bold text-ink">
            Knowledge Capture<span className="text-primary">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <MobileAccountMenu />
          </div>
        </div>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
