export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) return null;
  if (url.includes("your-project-ref") || anonKey.includes("your-anon-key")) return null;

  return { url, anonKey };
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
