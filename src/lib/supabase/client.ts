import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, isSupabaseConfigured } from "@/config/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppSupabase = SupabaseClient<any, "public", any>;

let client: AppSupabase | null = null;

export function getSupabase(): AppSupabase {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  if (!client) {
    client = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!);
  }
  return client;
}

export function tryGetSupabase(): AppSupabase | null {
  if (!isSupabaseConfigured) return null;
  return getSupabase();
}
