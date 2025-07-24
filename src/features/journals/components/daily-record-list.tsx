'use client';

import { useState } from 'react';
import DailyRecordCard from './daily-record-card';
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

interface DailyRecordListProps {
  records: DailySummaryWithJournals[];
  onUpdate?: () => void;
}

export default function DailyRecordList({
  records,
  onUpdate
}: DailyRecordListProps) {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  if (records.length === 0) {
    return (
      <div className='text-muted-foreground py-8 text-center'>
        No journal entries found for the selected criteria.
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {records.map((record) => (
        <DailyRecordCard
          key={record.id}
          record={record}
          isExpanded={expandedRecords.has(record.id)}
          onToggleExpanded={() => toggleExpanded(record.id)}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
