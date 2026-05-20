import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client using the service role key.
 * Bypasses RLS — only use inside server components and route handlers
 * after verifying the caller has admin role.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
