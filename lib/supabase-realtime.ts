import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseRealtimeClient: SupabaseClient | null = null

export function getSupabaseRealtimeClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !supabasePublishableKey) {
    return null
  }

  if (!supabaseRealtimeClient) {
    supabaseRealtimeClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    })
  }

  return supabaseRealtimeClient
}
