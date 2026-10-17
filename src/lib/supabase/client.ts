"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser Supabase client (singleton). Returns null when Supabase is not configured. */
export function getSupabaseBrowserClient() {
  const env = getSupabaseEnv();
  if (!env) return null;
  if (!client) client = createBrowserClient<Database>(env.url, env.anonKey);
  return client;
}
