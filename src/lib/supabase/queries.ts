import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

// Type for the Supabase client with your database schema
type TypedSupabaseClient = SupabaseClient<Database>;

//placeholder, waiting for future updates
