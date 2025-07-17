'use client';

import { Button } from '@/components/ui/button';
import { Heart, Loader2, Mic } from 'lucide-react';
import { useTodayMood } from '@/hooks/use-today-mood';
import { useAudioJournal } from '@/hooks/use-audio-journal';
import { getMoodDisplayData } from '@/lib/mood-utils';
import { getDayQualityIcon, getEmotionIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export default function OverviewPage() {
  const { moodEntry, isLoading, error } = useTodayMood();
  const moodDisplayData = getMoodDisplayData(moodEntry);
  const { stats, statsLoading, todayEntries } = useAudioJournal();

  return (
    <div className='space-y-8'>
      {/* Header with increased breathing space */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h2 className='text-4xl font-bold tracking-tight'>Overview</h2>
          <p className='text-muted-foreground text-sm'>
            Welcome to your EchoJournal dashboard
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={() => {
              const event = new CustomEvent('openDailyMoodModal');
              window.dispatchEvent(event);
            }}
            variant='ghost'
            className='hover:bg-muted/50 flex items-center gap-2 transition-colors'
          >
            <Heart className='h-4 w-4' />
            Daily Check-in
          </Button>
          <Button
            onClick={() => {
              const event = new CustomEvent('openAudioJournalModal');
              window.dispatchEvent(event);
            }}
            variant='ghost'
            className='hover:bg-muted/50 flex items-center gap-2 transition-colors'
          >
            <Mic className='h-4 w-4' />
            Voice Journal
          </Button>
        </div>
      </div>

      {/* Mood Today - Central Focus with Breathing Space */}
      <div className='flex justify-center'>
        <div className='group relative'>
          <div
            className={cn(
              'rounded-3xl p-8 transition-all duration-300',
              'from-card/50 to-card/30 bg-gradient-to-br',
              'hover:scale-105 hover:shadow-lg',
              'min-w-[300px] space-y-4 text-center'
            )}
          >
            <h3 className='text-muted-foreground mb-2 text-sm font-medium'>
              Mood Today
            </h3>

            {isLoading ? (
              <div className='flex h-24 items-center justify-center'>
                <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
              </div>
            ) : error ? (
              <div className='flex h-24 items-center justify-center'>
                <span className='text-destructive'>Failed to load</span>
              </div>
            ) : moodDisplayData.hasData ? (
              <>
                <div className='mb-4 flex justify-center'>
                  {getDayQualityIcon(moodDisplayData.dayQuality || '', true)}
                </div>
                <div className='space-y-2'>
                  <p className='text-2xl font-semibold'>
                    {moodDisplayData.primaryText}
                  </p>
                  <div className='flex flex-wrap justify-center gap-2'>
                    {moodDisplayData.emotions.slice(0, 3).map((emotion) => (
                      <div key={emotion} className='flex items-center gap-1'>
                        {getEmotionIcon(emotion, true)}
                        <span className='text-muted-foreground text-sm'>
                          {emotion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className='flex h-24 flex-col items-center justify-center gap-2'>
                <div className='text-muted-foreground/50 text-4xl'>-</div>
                <p className='text-muted-foreground text-sm'>
                  Complete daily check-in
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid with Borderless Design */}
      <div className='grid gap-6 md:grid-cols-3'>
        <div className='group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 transition-all duration-300'>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm font-medium'>
              Total Entries
            </p>
            <p className='text-3xl font-bold'>0</p>
            <p className='text-muted-foreground text-xs'>
              Start journaling today
            </p>
          </div>
        </div>

        <div className='group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 transition-all duration-300'>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm font-medium'>
              This Week
            </p>
            <p className='text-3xl font-bold'>0</p>
            <p className='text-muted-foreground text-xs'>Days journaled</p>
          </div>
        </div>

        <div className='group bg-muted/30 hover:bg-muted/50 rounded-2xl p-6 transition-all duration-300'>
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm font-medium'>Streak</p>
            <p className='text-3xl font-bold'>0</p>
            <p className='text-muted-foreground text-xs'>Consecutive days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
