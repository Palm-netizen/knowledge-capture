"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import LoginScreen from "./LoginScreen";

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session | null {
  return useContext(SessionContext);
}

// Nothing behind the gate mounts (and so nothing fetches data) until there's
// a signed-in session. The database itself only answers the owner account.
export default function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted">กำลังโหลด...</div>;
  }
  if (!session) return <LoginScreen />;
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}
