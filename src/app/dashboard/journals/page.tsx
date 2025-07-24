import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import JournalListPage from '@/features/journals/components/journal-list-page';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Journals'
};

function JournalListSkeleton() {
  return (
    <div className='space-y-4'>
      {/* Filter skeleton */}
      <div className='flex flex-wrap gap-4'>
        <Skeleton className='h-10 w-48' />
        <Skeleton className='h-10 w-32' />
        <Skeleton className='h-10 w-64' />
      </div>

      {/* Daily record cards skeleton */}
      <div className='space-y-3'>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className='h-24 w-full' />
        ))}
      </div>
    </div>
  );
}

export default async function JournalsPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='My Journals'
            description='View and manage your voice journal entries'
          />
        </div>
        <Separator />
        <Suspense fallback={<JournalListSkeleton />}>
          <JournalListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
