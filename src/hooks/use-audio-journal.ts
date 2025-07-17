'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import {
  getTodayAudioJournals,
  getRecentAudioJournals,
  getAudioJournalStats
} from '@/lib/supabase/queries';
import type { Tables } from '@/types/supabase';

type AudioJournalWithTranscript = Tables<'audio_files'> & {
  transcripts: {
    id: string;
    text: string | null;
    language: string | null;
    created_at: string | null;
  }[];
};

interface AudioJournalStats {
  totalEntries: number;
  thisWeekEntries: number;
  currentStreak: number;
}

interface UseAudioJournalReturn {
  // Today's entries
  todayEntries: AudioJournalWithTranscript[];
  todayLoading: boolean;
  todayError: string | null;

  // Recent entries
  recentEntries: AudioJournalWithTranscript[];
  recentLoading: boolean;
  recentError: string | null;

  // Stats
  stats: AudioJournalStats;
  statsLoading: boolean;
  statsError: string | null;

  // Actions
  refetchAll: () => Promise<void>;
  refetchToday: () => Promise<void>;
  refetchRecent: () => Promise<void>;
  refetchStats: () => Promise<void>;
}

export function useAudioJournal(): UseAudioJournalReturn {
  const { user } = useUser();
  const supabase = createClient();

  // Today's entries state
  const [todayEntries, setTodayEntries] = useState<
    AudioJournalWithTranscript[]
  >([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState<string | null>(null);

  // Recent entries state
  const [recentEntries, setRecentEntries] = useState<
    AudioJournalWithTranscript[]
  >([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<AudioJournalStats>({
    totalEntries: 0,
    thisWeekEntries: 0,
    currentStreak: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Fetch today's entries
  const fetchTodayEntries = useCallback(async () => {
    if (!user?.id) {
      setTodayEntries([]);
      setTodayLoading(false);
      return;
    }

    try {
      setTodayError(null);
      const entries = await getTodayAudioJournals(supabase, user.id);
      setTodayEntries(entries);
    } catch (err) {
      console.error('Error fetching today audio entries:', err);
      setTodayError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch today audio entries'
      );
    } finally {
      setTodayLoading(false);
    }
  }, [user?.id, supabase]);

  // Fetch recent entries
  const fetchRecentEntries = useCallback(async () => {
    if (!user?.id) {
      setRecentEntries([]);
      setRecentLoading(false);
      return;
    }

    try {
      setRecentError(null);
      const entries = await getRecentAudioJournals(supabase, user.id, 10);
      setRecentEntries(entries);
    } catch (err) {
      console.error('Error fetching recent audio entries:', err);
      setRecentError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch recent audio entries'
      );
    } finally {
      setRecentLoading(false);
    }
  }, [user?.id, supabase]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user?.id) {
      setStats({ totalEntries: 0, thisWeekEntries: 0, currentStreak: 0 });
      setStatsLoading(false);
      return;
    }

    try {
      setStatsError(null);
      const statsData = await getAudioJournalStats(supabase, user.id);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching audio journal stats:', err);
      setStatsError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch audio journal stats'
      );
    } finally {
      setStatsLoading(false);
    }
  }, [user?.id, supabase]);

  // Refetch functions
  const refetchToday = useCallback(async () => {
    setTodayLoading(true);
    await fetchTodayEntries();
  }, [fetchTodayEntries]);

  const refetchRecent = useCallback(async () => {
    setRecentLoading(true);
    await fetchRecentEntries();
  }, [fetchRecentEntries]);

  const refetchStats = useCallback(async () => {
    setStatsLoading(true);
    await fetchStats();
  }, [fetchStats]);

  const refetchAll = useCallback(async () => {
    setTodayLoading(true);
    setRecentLoading(true);
    setStatsLoading(true);

    await Promise.all([
      fetchTodayEntries(),
      fetchRecentEntries(),
      fetchStats()
    ]);
  }, [fetchTodayEntries, fetchRecentEntries, fetchStats]);

  // Initial fetch
  useEffect(() => {
    fetchTodayEntries();
    fetchRecentEntries();
    fetchStats();
  }, [fetchTodayEntries, fetchRecentEntries, fetchStats]);

  // Listen for audio journal updates
  useEffect(() => {
    const handleAudioJournalUpdate = () => {
      refetchAll();
    };

    window.addEventListener('audioJournalUpdated', handleAudioJournalUpdate);
    return () => {
      window.removeEventListener(
        'audioJournalUpdated',
        handleAudioJournalUpdate
      );
    };
  }, [refetchAll]);

  return {
    todayEntries,
    todayLoading,
    todayError,
    recentEntries,
    recentLoading,
    recentError,
    stats,
    statsLoading,
    statsError,
    refetchAll,
    refetchToday,
    refetchRecent,
    refetchStats
  };
}
