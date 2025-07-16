'use client';

import PageContainer from '@/components/layout/page-container';
import DailyMoodModal, {
  DailyMoodModalRef
} from '@/features/daily-record/components/daily-mood-modal';
import React, { useRef, useEffect } from 'react';

export default function OverViewLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const modalRef = useRef<DailyMoodModalRef>(null);

  useEffect(() => {
    const handleOpenModal = () => {
      modalRef.current?.openModal();
    };

    window.addEventListener('openDailyMoodModal', handleOpenModal);
    return () => {
      window.removeEventListener('openDailyMoodModal', handleOpenModal);
    };
  }, []);

  return (
    <PageContainer>
      <DailyMoodModal ref={modalRef} />
      <div key='overview-content'>{children}</div>
    </PageContainer>
  );
}
