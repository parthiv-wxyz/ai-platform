import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getProviderEnv, getSupabaseEnv } from "@/lib/env";

export function createAdminSupabaseClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getSupabaseEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getProviderEnv();
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
