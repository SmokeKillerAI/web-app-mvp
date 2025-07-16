import PageContainer from '@/components/layout/page-container';
import React from 'react';

export default function OverViewLayout() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'></div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'></div>
      </div>
    </PageContainer>
  );
}
