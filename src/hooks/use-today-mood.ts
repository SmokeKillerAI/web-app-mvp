'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import { getTodayMoodEntry } from '@/lib/supabase/queries';
import type { Tables } from '@/types/supabase';

interface UseTodayMoodReturn {
  moodEntry: Tables<'daily_question'> | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTodayMood(): UseTodayMoodReturn {
  const { user } = useUser();
  const [moodEntry, setMoodEntry] = useState<Tables<'daily_question'> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchMoodEntry = useCallback(async () => {
    if (!user?.id) {
      setMoodEntry(null);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const entry = await getTodayMoodEntry(supabase, user.id);
      setMoodEntry(entry);
    } catch (err) {
      console.error('Error fetching mood entry:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch mood entry'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, supabase]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchMoodEntry();
  }, [fetchMoodEntry]);

  useEffect(() => {
    fetchMoodEntry();
  }, [fetchMoodEntry]);

  // Listen for mood entry updates
  useEffect(() => {
    const handleMoodUpdate = () => {
      refetch();
    };

    window.addEventListener('moodEntryUpdated', handleMoodUpdate);
    return () => {
      window.removeEventListener('moodEntryUpdated', handleMoodUpdate);
    };
  }, [refetch]);

  return {
    moodEntry,
    isLoading,
    error,
    refetch
  };
}
