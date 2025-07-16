import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase';

// Define a function to create a Supabase client for server-side operations (data only)
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables');
  }

  // Simplified server client for data operations only (no auth cookies needed with Clerk)
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get() {
        return undefined;
      },
      set() {},
      remove() {}
    }
  });
};
