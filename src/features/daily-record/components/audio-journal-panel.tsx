'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, Square, Loader2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioJournalPanelProps {
  className?: string;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
type ProcessingState =
  | 'idle'
  | 'transcribing'
  | 'summarizing'
  | 'saving'
  | 'complete'
  | 'error';

const MAX_RECORDING_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function AudioJournalPanel({
  className
}: AudioJournalPanelProps) {
  const { user } = useUser();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [processingState, setProcessingState] =
    useState<ProcessingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const resetState = useCallback(() => {
    setRecordingState('idle');
    setProcessingState('idle');
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setSummary('');
    setError(null);
    setIsPlaying(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startRecording = async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setRecordingState('stopped');
      };

      mediaRecorder.start(1000);
      setRecordingState('recording');

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1000;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return newTime;
        });
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [recordingState]);

  const processAudio = async () => {
    if (!audioBlob || !user?.id) return;

    try {
      setProcessingState('transcribing');

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', user.id);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      setTranscription(result.transcription);
      setSummary(result.summary);
      setProcessingState('complete');

      // Dispatch event to notify other components
      const event = new CustomEvent('audioJournalUpdated');
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Error processing audio:', err);
      setError('Failed to process audio. Please try again.');
      setProcessingState('error');
    }
  };

  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    return Math.min((recordingTime / MAX_RECORDING_TIME) * 100, 100);
  };

  const getStatusText = () => {
    switch (processingState) {
      case 'transcribing':
        return 'Converting speech to text...';
      case 'summarizing':
        return 'Generating summary...';
      case 'saving':
        return 'Saving your journal...';
      case 'complete':
        return 'Journal saved successfully!';
      case 'error':
        return 'Processing failed';
      default:
        if (recordingState === 'recording') return 'Recording in progress...';
        if (recordingState === 'stopped') return 'Recording complete';
        return 'Ready to record your thoughts';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const isRecording = recordingState === 'recording';
  const hasRecording = recordingState === 'stopped' && audioBlob;
  const isProcessing =
    processingState !== 'idle' && processingState !== 'complete';
  const isComplete = processingState === 'complete';

  return (
    <div className={cn('mx-auto w-full max-w-md', className)}>
      {/* Central recording interface */}
      <div className='space-y-6 p-4'>
        {/* Title */}
        <div className='space-y-2 text-center'>
          <h2 className='text-foreground text-2xl font-bold'>Voice Journal</h2>
          <p className='text-muted-foreground text-sm'>
            Speak your thoughts, let AI organize them
          </p>
        </div>

        {/* Recording Status */}
        <div className='space-y-4 text-center'>
          <div className='text-foreground font-mono text-3xl font-bold'>
            {formatTime(recordingTime)}
          </div>
          <div className='text-muted-foreground text-sm'>{getStatusText()}</div>
        </div>

        {/* Progress Bar */}
        <div className='space-y-2'>
          <Progress value={getProgressPercent()} className='bg-muted h-2' />
          <div className='text-muted-foreground text-center text-xs'>
            Maximum: {formatTime(MAX_RECORDING_TIME)}
          </div>
        </div>

        {/* Main Recording Button */}
        <div className='flex justify-center'>
          {!hasRecording ? (
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              size='lg'
              className={cn(
                'h-20 w-20 rounded-full transition-all duration-300',
                'shadow-lg hover:shadow-xl',
                isRecording
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-primary hover:bg-primary/90 hover:scale-105'
              )}
            >
              {isRecording ? (
                <Square className='h-8 w-8' />
              ) : (
                <Mic className='h-8 w-8' />
              )}
            </Button>
          ) : (
            <div className='flex items-center gap-4'>
              <Button
                onClick={toggleAudioPlayback}
                variant='outline'
                size='lg'
                className='h-16 w-16 rounded-full'
              >
                {isPlaying ? (
                  <Pause className='h-6 w-6' />
                ) : (
                  <Play className='h-6 w-6' />
                )}
              </Button>

              <Button
                onClick={processAudio}
                disabled={isProcessing}
                size='lg'
                className='rounded-full px-8 py-4 shadow-lg hover:shadow-xl'
              >
                {isProcessing ? (
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                ) : null}
                {isProcessing ? 'Processing...' : 'Process Recording'}
              </Button>
            </div>
          )}
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className='hidden'
          />
        )}

        {/* Error Display */}
        {error && (
          <div className='bg-destructive/10 border-destructive/20 rounded-lg border p-4'>
            <div className='text-destructive text-center text-sm'>{error}</div>
          </div>
        )}

        {/* Results Display */}
        {isComplete && (transcription || summary) && (
          <div className='border-border/50 space-y-4 border-t pt-4'>
            {transcription && (
              <div className='space-y-2'>
                <h4 className='text-foreground text-sm font-medium'>
                  Transcription
                </h4>
                <div className='bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm'>
                  {transcription}
                </div>
              </div>
            )}
            {summary && (
              <div className='space-y-2'>
                <h4 className='text-foreground text-sm font-medium'>Summary</h4>
                <div className='bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm'>
                  {summary}
                </div>
              </div>
            )}
            <div className='pt-4 text-center'>
              <Button
                onClick={resetState}
                variant='outline'
                size='sm'
                className='rounded-full'
              >
                Record Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
