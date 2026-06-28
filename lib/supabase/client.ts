import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return createBrowserClient(config.url, config.anonKey);
}

// Singleton for client components
let client: ReturnType<typeof createClient> | null = null;
export function getSupabaseClient() {
  if (!client) client = createClient();
  return client;
}

export function getOptionalSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return getSupabaseClient();
}
