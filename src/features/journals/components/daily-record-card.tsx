'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CalendarIcon,
  FileTextIcon,
  HashIcon
} from 'lucide-react';
import { formatDate } from '@/lib/format';
import JournalEntryCard from './journal-entry-card';
import type { Tables } from '@/types/supabase';

type DailySummaryWithJournals = Tables<'daily_summaries'> & {
  journals: Array<
    Tables<'audio_files'> & {
      transcripts: Array<
        Pick<
          Tables<'transcripts'>,
          'id' | 'text' | 'rephrased_text' | 'language' | 'created_at'
        >
      >;
    }
  >;
  dailyMood: Tables<'daily_question'> | null;
};

interface DailyRecordCardProps {
  record: DailySummaryWithJournals;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdate?: () => void;
}

const getMoodColor = (mood: string | null) => {
  switch (mood) {
    case 'Good day':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Bad day':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Just so so':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatEmotions = (emotions: string[] | null) => {
  if (!emotions || emotions.length === 0) return '';
  return emotions.join(', ');
};

export default function DailyRecordCard({
  record,
  isExpanded,
  onToggleExpanded,
  onUpdate
}: DailyRecordCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formattedDate = formatDate(record.date);
  const moodColor = getMoodColor(record.mood_quality);
  const emotions = formatEmotions(record.dominant_emotions);

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isExpanded ? 'ring-2 ring-blue-200' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className='hover:bg-accent/50 cursor-pointer transition-colors'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  {isExpanded ? (
                    <ChevronDownIcon className='text-muted-foreground h-4 w-4' />
                  ) : (
                    <ChevronRightIcon className='text-muted-foreground h-4 w-4' />
                  )}
                  <CalendarIcon className='text-muted-foreground h-4 w-4' />
                  <span className='font-medium'>{formattedDate}</span>
                </div>

                {record.mood_quality && (
                  <Badge variant='outline' className={moodColor}>
                    {record.mood_quality}
                  </Badge>
                )}

                <div className='text-muted-foreground flex items-center space-x-1 text-sm'>
                  <FileTextIcon className='h-3 w-3' />
                  <span>{record.entry_count} entries</span>
                </div>
              </div>

              {emotions && (
                <div className='text-muted-foreground flex items-center space-x-1 text-sm'>
                  <HashIcon className='h-3 w-3' />
                  <span className='max-w-48 truncate'>{emotions}</span>
                </div>
              )}
            </div>

            {/* Summary preview - only shown when collapsed */}
            {!isExpanded && (
              <div className='mt-2 pl-6'>
                <p className='text-muted-foreground line-clamp-2 text-sm'>
                  {record.summary}
                </p>
              </div>
            )}
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className='space-y-4 pt-0'>
            {/* Full summary when expanded */}
            <div className='bg-accent/30 rounded-lg p-4'>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-medium'>
                <FileTextIcon className='h-4 w-4' />
                Daily Summary
              </h4>
              <p className='text-sm leading-relaxed'>{record.summary}</p>
            </div>

            {/* Journal entries */}
            {record.journals.length > 0 && (
              <div className='space-y-3'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <CalendarIcon className='h-4 w-4' />
                  Journal Entries ({record.journals.length})
                </h4>
                <div className='space-y-2'>
                  {record.journals.map((journal) => (
                    <JournalEntryCard
                      key={journal.id}
                      journal={journal}
                      onUpdate={onUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {record.journals.length === 0 && (
              <div className='text-muted-foreground py-4 text-center text-sm'>
                No journal entries found for this day
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
