import type { Tables } from '@/types/supabase';

export function formatDayQuality(dayQuality: string): string {
  switch (dayQuality) {
    case 'good':
      return 'Good day';
    case 'bad':
      return 'Bad day';
    case 'so-so':
      return 'Just so so';
    default:
      return dayQuality;
  }
}

export function formatEmotions(emotions: string[]): string {
  if (!emotions || emotions.length === 0) return '';

  if (emotions.length === 1) {
    return emotions[0];
  }

  if (emotions.length === 2) {
    return emotions.join(' & ');
  }

  // For more than 2 emotions, show first 2 and count
  const firstTwo = emotions.slice(0, 2);
  const remaining = emotions.length - 2;
  return `${firstTwo.join(', ')} +${remaining}`;
}

export function getMoodDisplayData(moodEntry: Tables<'daily_question'> | null) {
  if (!moodEntry) {
    return {
      primaryText: '-',
      secondaryText: 'Complete daily check-in',
      hasData: false
    };
  }

  const dayQuality = formatDayQuality(moodEntry.day_quality);
  const emotions = formatEmotions(moodEntry.emotions || []);

  return {
    primaryText: dayQuality,
    secondaryText: emotions || 'No emotions selected',
    hasData: true
  };
}
