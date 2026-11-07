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
          <div className="flex min-h-dvh">
            <Sidebar />
            <div className="min-w-0 flex-1">
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
