'use client';

import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef
} from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Square, Play, Pause, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AudioJournalModalRef {
  openModal: () => void;
}

interface AudioJournalModalProps {}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';
type ProcessingState =
  | 'idle'
  | 'transcribing'
  | 'summarizing'
  | 'saving'
  | 'complete'
  | 'error';

const MAX_RECORDING_TIME = 10 * 60 * 1000; // 10 minutes in milliseconds

const AudioJournalModal = forwardRef<
  AudioJournalModalRef,
  AudioJournalModalProps
>((_, ref) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [processingState, setProcessingState] =
    useState<ProcessingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
    resetState();
  }, []);

  const resetState = useCallback(() => {
    setRecordingState('idle');
    setProcessingState('idle');
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscription('');
    setSummary('');
    setError(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    openModal
  }));

  const startRecording = async () => {
    try {
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

      mediaRecorder.start(1000); // Collect data every second
      setRecordingState('recording');

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1000;
          // Auto-stop at max time
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

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    return Math.min((recordingTime / MAX_RECORDING_TIME) * 100, 100);
  };

  const getProcessingMessage = () => {
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
        return '';
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Audio Journal</DialogTitle>
          <DialogDescription>
            Record your thoughts and let AI transcribe and summarize them.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Recording Controls */}
          <div className='flex flex-col items-center space-y-4'>
            {/* Recording Status */}
            <div className='text-center'>
              <div className='font-mono text-2xl font-bold'>
                {formatTime(recordingTime)}
              </div>
              <div className='text-muted-foreground text-sm'>
                {isRecording
                  ? 'Recording...'
                  : hasRecording
                    ? 'Recording complete'
                    : 'Ready to record'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className='w-full'>
              <Progress value={getProgressPercent()} className='h-2' />
              <div className='text-muted-foreground mt-1 text-center text-xs'>
                Max: {formatTime(MAX_RECORDING_TIME)}
              </div>
            </div>

            {/* Recording Button */}
            <div className='flex items-center space-x-4'>
              {!hasRecording && (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  size='lg'
                  className={cn(
                    'h-16 w-16 rounded-full',
                    isRecording
                      ? 'animate-pulse bg-red-500 hover:bg-red-600'
                      : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {isRecording ? (
                    <Square className='h-6 w-6' />
                  ) : (
                    <Mic className='h-6 w-6' />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Audio Playback */}
          {hasRecording && audioUrl && (
            <div className='space-y-3'>
              <div className='text-sm font-medium'>Preview Recording</div>
              <audio
                ref={audioRef}
                controls
                src={audioUrl}
                className='w-full'
              />
            </div>
          )}

          {/* Processing Status */}
          {isProcessing && (
            <div className='bg-muted flex items-center space-x-3 rounded-lg p-4'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span className='text-sm'>{getProcessingMessage()}</span>
            </div>
          )}

          {/* Results */}
          {processingState === 'complete' && transcription && (
            <div className='space-y-4'>
              <div>
                <div className='mb-2 text-sm font-medium'>Transcription</div>
                <div className='bg-muted rounded-lg p-3 text-sm'>
                  {transcription}
                </div>
              </div>
              {summary && (
                <div>
                  <div className='mb-2 text-sm font-medium'>Summary</div>
                  <div className='bg-muted rounded-lg p-3 text-sm'>
                    {summary}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className='bg-destructive/10 border-destructive/20 rounded-lg border p-3'>
              <div className='text-destructive text-sm'>{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex justify-end space-x-2'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
              disabled={isRecording || isProcessing}
            >
              {processingState === 'complete' ? 'Close' : 'Cancel'}
            </Button>

            {hasRecording && processingState === 'idle' && (
              <Button onClick={processAudio}>Process Recording</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

AudioJournalModal.displayName = 'AudioJournalModal';

export default AudioJournalModal;
