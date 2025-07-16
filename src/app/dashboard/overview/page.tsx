'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function OverviewPage() {
  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>Overview</h2>
          <p className='text-muted-foreground'>
            Welcome to your EchoJournal dashboard
          </p>
        </div>
        <Button
          onClick={() => {
            // This will be handled by the modal in layout
            const event = new CustomEvent('openDailyMoodModal');
            window.dispatchEvent(event);
          }}
          className='flex items-center gap-2'
        >
          <Heart className='h-4 w-4' />
          Daily Check-in
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-muted-foreground text-xs'>
              Start journaling today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-muted-foreground text-xs'>Days journaled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Mood Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>-</div>
            <p className='text-muted-foreground text-xs'>
              Complete daily check-in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>0</div>
            <p className='text-muted-foreground text-xs'>Consecutive days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Begin your journaling journey with EchoJournal AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-muted-foreground text-sm'>
            Complete your daily mood check-in to start building your emotional
            insights. Your responses will help the AI assistant understand your
            patterns and provide personalized guidance over time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
