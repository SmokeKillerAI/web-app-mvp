import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

// Type for the Supabase client with your database schema
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Get today's mood entry for the specified user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Today's mood entry or null if not exists
 */
export const getTodayMoodEntry = cache(
  async (supabase: TypedSupabaseClient, userId: string) => {
    if (!userId) return null;

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('daily_question')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today)
      .lt('created_at', tomorrow)
      .single();

    if (error && error.code === 'PGRST116') {
      // No entry found for today
      return null;
    }

    if (error) {
      console.error('Error fetching today mood entry:', error);
      return null;
    }

    return data;
  }
);
