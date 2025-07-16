'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';
import { TablesInsert } from '@/types/supabase';

const DAY_QUALITY_OPTIONS = [
  { value: 'good', label: 'Good day' },
  { value: 'bad', label: 'Bad day' },
  { value: 'so-so', label: 'Just so so' }
];

const EMOTION_OPTIONS = ['Happy', 'Anxious', 'Anger', 'Sadness', 'Despair'];

export default function DailyMoodModal() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dayQuality, setDayQuality] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    const checkDailyEntry = async () => {
      if (!user?.id) return;

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_question')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', today)
        .lt(
          'created_at',
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        )
        .single();

      if (error && error.code === 'PGRST116') {
        // No entry found for today
        setIsOpen(true);
      }
    };

    checkDailyEntry();
  }, [user?.id, supabase]);

  const handleEmotionChange = (emotion: string, checked: boolean) => {
    setSelectedEmotions((prev) =>
      checked ? [...prev, emotion] : prev.filter((e) => e !== emotion)
    );
  };

  const handleSubmit = async () => {
    if (!user?.id || !dayQuality) return;

    setIsLoading(true);

    const entry: TablesInsert<'daily_question'> = {
      user_id: user.id,
      day_quality: dayQuality,
      emotions: selectedEmotions
    };

    const { error } = await supabase.from('daily_question').insert(entry);

    if (!error) {
      setIsOpen(false);
      setDayQuality('');
      setSelectedEmotions([]);
    }

    setIsLoading(false);
  };

  const isValid = dayQuality.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Daily Check-in</DialogTitle>
          <DialogDescription>
            How was your day today? Please share your thoughts with us.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Question 1: Day Quality */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>How was your day?</Label>
            <RadioGroup value={dayQuality} onValueChange={setDayQuality}>
              {DAY_QUALITY_OPTIONS.map((option) => (
                <div key={option.value} className='flex items-center space-x-2'>
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className='cursor-pointer'>
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question 2: Emotions */}
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>
              How do you feel today?
            </Label>
            <div className='space-y-2'>
              {EMOTION_OPTIONS.map((emotion) => (
                <div key={emotion} className='flex items-center space-x-2'>
                  <Checkbox
                    id={emotion}
                    checked={selectedEmotions.includes(emotion)}
                    onCheckedChange={(checked) =>
                      handleEmotionChange(emotion, checked as boolean)
                    }
                  />
                  <Label htmlFor={emotion} className='cursor-pointer'>
                    {emotion}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
