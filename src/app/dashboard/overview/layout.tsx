'use client';

import PageContainer from '@/components/layout/page-container';
import DailyMoodModal, {
  DailyMoodModalRef
} from '@/features/daily-record/components/daily-mood-modal';
import AudioJournalModal, {
  AudioJournalModalRef
} from '@/features/daily-record/components/audio-journal-modal';
import React, { useRef, useEffect } from 'react';

export default function OverViewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const moodModalRef = useRef<DailyMoodModalRef>(null);
  const audioJournalModalRef = useRef<AudioJournalModalRef>(null);

  useEffect(() => {
    const handleOpenMoodModal = () => {
      moodModalRef.current?.openModal();
    };

    const handleOpenAudioJournalModal = () => {
      audioJournalModalRef.current?.openModal();
    };

    window.addEventListener('openDailyMoodModal', handleOpenMoodModal);
    window.addEventListener(
      'openAudioJournalModal',
      handleOpenAudioJournalModal
    );

    return () => {
      window.removeEventListener('openDailyMoodModal', handleOpenMoodModal);
      window.removeEventListener(
        'openAudioJournalModal',
        handleOpenAudioJournalModal
      );
    };
  }, []);

  return (
    <PageContainer>
      <DailyMoodModal ref={moodModalRef} />
      <AudioJournalModal ref={audioJournalModalRef} />
      <div key='overview-content'>{children}</div>
    </PageContainer>
  );
}
