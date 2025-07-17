import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Create a Supabase client with service role key for admin operations
// This client bypasses RLS and should only be used in secure server-side contexts
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing required Supabase admin environment variables');
  }

  // Admin client with service role key - bypasses RLS
  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {}
    }
  });
};
