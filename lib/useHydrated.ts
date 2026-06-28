"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns false during SSR and the first client render, true afterwards.
 * Use to gate rendering of Zustand-persisted data so server and client
 * markup match on first paint (avoids hydration mismatches).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );
}
