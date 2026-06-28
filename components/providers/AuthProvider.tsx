"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { getOptionalSupabaseClient } from "@/lib/supabase/client";
import { loadAllData } from "@/lib/supabase/db";
import { useStore } from "@/store/useStore";
import type { AuthUser } from "@/types";

const AuthContext = createContext<{ user: AuthUser | null }>({ user: null });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const hydrateFromDB = useStore((s) => s.hydrateFromDB);
  const currentUser = useStore((s) => s.currentUser);
  const hydrated = useRef(false);

  useEffect(() => {
    const supabase = getOptionalSupabaseClient();
    if (!supabase) return;

    async function hydrate(userId: string) {
      if (hydrated.current) return;
      hydrated.current = true;
      const data = await loadAllData(userId);
      hydrateFromDB(data);
    }

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser({ id: user.id, email: user.email ?? "" });
        hydrate(user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user;

      if (user) {
        setCurrentUser({ id: user.id, email: user.email ?? "" });
        hydrate(user.id);
      }

      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        hydrated.current = false;
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ user: currentUser }}>{children}</AuthContext.Provider>;
}
