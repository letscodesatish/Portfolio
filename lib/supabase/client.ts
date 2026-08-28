"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Browser-side Supabase client (anon key — read-only under RLS). Lazily
 * created so importing this module never throws when the env vars aren't
 * configured yet; callers should check `isSupabaseConfigured()` first.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  if (!browserClient) {
    browserClient = createClient<Database>(url, anonKey);
  }
  return browserClient;
}
