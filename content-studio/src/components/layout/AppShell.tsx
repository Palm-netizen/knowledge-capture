"use client";

import { StoreProvider } from "@/lib/store/StoreProvider";
import { FeedbackProvider } from "@/components/ui/Feedback";
import { QuickActionsProvider } from "@/components/capture/QuickActions";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileTopBar } from "./MobileTopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <FeedbackProvider>
        <QuickActionsProvider>
          <div className="min-h-dvh md:flex md:gap-3 md:p-3">
            <Sidebar />
            <div className="min-w-0 flex-1 md:min-h-[calc(100dvh-24px)] md:rounded-[28px] md:bg-panel">
              <MobileTopBar />
              <main>{children}</main>
            </div>
          </div>
          <MobileNav />
        </QuickActionsProvider>
      </FeedbackProvider>
    </StoreProvider>
  );
}
