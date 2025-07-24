'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  PlayIcon,
  PauseIcon,
  EditIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { formatDate } from '@/lib/format';
import type { Tables } from '@/types/supabase';

type JournalEntry = Tables<'audio_files'> & {
  transcripts: Array<
    Pick<
      Tables<'transcripts'>,
      'id' | 'text' | 'rephrased_text' | 'language' | 'created_at'
    >
  >;
};

interface JournalEntryCardProps {
  journal: JournalEntry;
  onUpdate?: () => void;
}

export default function JournalEntryCard({
  journal,
  onUpdate
}: JournalEntryCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const transcript = journal.transcripts[0];
  const entryTime = formatDate(journal.created_at!, 'time');

  const handlePlayAudio = async () => {
    try {
      if (!audio) {
        // Create audio element and load the file
        const newAudio = new Audio();

        // For now, we'll need to create a public URL for the audio file
        // This might need to be implemented as an API endpoint that serves the audio
        const audioUrl = `/api/audio/${journal.id}`;
        newAudio.src = audioUrl;

        newAudio.addEventListener('ended', () => {
          setIsPlaying(false);
        });

        newAudio.addEventListener('error', (e) => {
          console.error('Audio playback error:', e);
          setIsPlaying(false);
        });

        setAudio(newAudio);
        await newAudio.play();
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          await audio.play();
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const handleEdit = () => {
    if (transcript) {
      setEditedText(transcript.rephrased_text || transcript.text || '');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!transcript || !editedText.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/journals/${journal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rephrased_text: editedText.trim()
        })
      });

      if (response.ok) {
        setIsEditing(false);
        onUpdate?.();
      } else {
        console.error('Failed to update journal entry');
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      try {
        const response = await fetch(`/api/journals/${journal.id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onUpdate?.();
        } else {
          console.error('Failed to delete journal entry');
        }
      } catch (error) {
        console.error('Error deleting journal entry:', error);
      }
    }
  };

  return (
    <Card className='bg-card/50 border-muted'>
      <CardContent className='space-y-3 p-4'>
        {/* Header with timestamp and actions */}
        <div className='flex items-center justify-between'>
          <div className='text-muted-foreground flex items-center space-x-2 text-sm'>
            <ClockIcon className='h-3 w-3' />
            <span>{entryTime}</span>
            {transcript?.language && (
              <Badge variant='outline' className='text-xs'>
                {transcript.language.toUpperCase()}
              </Badge>
            )}
          </div>

          <div className='flex items-center space-x-1'>
            {!isEditing ? (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handlePlayAudio}
                  title={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? (
                    <PauseIcon className='h-3 w-3' />
                  ) : (
                    <PlayIcon className='h-3 w-3' />
                  )}
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleEdit}
                  title='Edit transcript'
                >
                  <EditIcon className='h-3 w-3' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:text-destructive h-8 w-8'
                  onClick={handleDelete}
                  title='Delete entry'
                >
                  <TrashIcon className='h-3 w-3' />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-green-600 hover:text-green-700'
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  title='Save changes'
                >
                  <CheckIcon className='h-3 w-3' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  title='Cancel editing'
                >
                  <XIcon className='h-3 w-3' />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Transcript content */}
        {transcript && (
          <div className='space-y-2'>
            {isEditing ? (
              <div className='space-y-2'>
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder='Edit your journal entry...'
                  className='min-h-20 text-sm'
                  disabled={isSaving}
                />
                {isSaving && (
                  <p className='text-muted-foreground text-xs'>
                    Saving changes...
                  </p>
                )}
              </div>
            ) : (
              <>
                {transcript.rephrased_text ? (
                  <div>
                    <p className='text-sm leading-relaxed'>
                      {transcript.rephrased_text}
                    </p>
                    {transcript.text &&
                      transcript.text !== transcript.rephrased_text && (
                        <details className='mt-2'>
                          <summary className='text-muted-foreground hover:text-foreground cursor-pointer text-xs'>
                            View original transcript
                          </summary>
                          <p className='text-muted-foreground border-muted mt-1 border-l-2 pl-3 text-xs'>
                            {transcript.text}
                          </p>
                        </details>
                      )}
                  </div>
                ) : (
                  <p className='text-sm leading-relaxed'>{transcript.text}</p>
                )}
              </>
            )}
          </div>
        )}

        {!transcript && (
          <p className='text-muted-foreground text-sm italic'>
            No transcript available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
