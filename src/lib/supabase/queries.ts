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

/**
 * Get recent audio journal entries for the specified user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @param limit - Number of entries to fetch (default: 10)
 * @returns Recent audio journal entries with transcripts
 */
export const getRecentAudioJournals = cache(
  async (supabase: TypedSupabaseClient, userId: string, limit: number = 10) => {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('audio_files')
      .select(
        `
        *,
        transcripts (
          id,
          text,
          language,
          created_at
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching audio journals:', error);
      return [];
    }

    return data;
  }
);

/**
 * Get today's audio journal entries for the specified user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Today's audio journal entries
 */
export const getTodayAudioJournals = cache(
  async (supabase: TypedSupabaseClient, userId: string) => {
    if (!userId) return [];

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data, error } = await supabase
      .from('audio_files')
      .select(
        `
        *,
        transcripts (
          id,
          text,
          language,
          created_at
        )
      `
      )
      .eq('user_id', userId)
      .gte('created_at', today)
      .lt('created_at', tomorrow)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching today audio journals:', error);
      return [];
    }

    return data;
  }
);

/**
 * Get audio journal stats for the specified user
 * @param supabase - Supabase client instance
 * @param userId - User ID
 * @returns Audio journal statistics
 */
export const getAudioJournalStats = cache(
  async (supabase: TypedSupabaseClient, userId: string) => {
    if (!userId)
      return { totalEntries: 0, thisWeekEntries: 0, currentStreak: 0 };

    // Get total entries
    const { count: totalEntries, error: totalError } = await supabase
      .from('audio_files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (totalError) {
      console.error('Error fetching total audio entries:', totalError);
    }

    // Get this week's entries
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { count: thisWeekEntries, error: weekError } = await supabase
      .from('audio_files')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', weekStart.toISOString());

    if (weekError) {
      console.error('Error fetching week audio entries:', weekError);
    }

    // Calculate current streak (simplified - consecutive days with entries)
    const { data: recentEntries, error: recentError } = await supabase
      .from('audio_files')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    let currentStreak = 0;
    if (!recentError && recentEntries) {
      const today = new Date();
      const dates = new Set(
        recentEntries.map(
          (entry) => new Date(entry.created_at!).toISOString().split('T')[0]
        )
      );

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateString = checkDate.toISOString().split('T')[0];

        if (dates.has(dateString)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalEntries: totalEntries || 0,
      thisWeekEntries: thisWeekEntries || 0,
      currentStreak
    };
  }
);
