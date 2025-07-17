import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createAdminClient } from '@/lib/supabase/admin';
import { auth } from '@clerk/nextjs/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Validate file size (25MB limit for Whisper)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    console.log(
      `Processing audio file: ${audioFile.name}, size: ${audioFile.size} bytes`
    );

    // Step 1: Transcribe audio with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text'
    });

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { error: 'No speech detected in audio' },
        { status: 400 }
      );
    }

    console.log(
      'Transcription completed:',
      transcription.substring(0, 100) + '...'
    );

    // Step 2: Generate AI summary
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that summarizes personal journal entries. 
                   Create a concise, structured summary that:
                   - Removes redundancies and filler words
                   - Corrects grammar while preserving the original meaning and tone
                   - Highlights key themes, emotions, and important points
                   - Organizes content logically
                   - Keeps the personal, reflective nature intact
                   - Aims for 2-3 sentences maximum unless the content is very rich`
        },
        {
          role: 'user',
          content: `Please summarize this journal entry:\n\n${transcription}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const summary = summaryResponse.choices[0]?.message?.content || '';
    console.log('Summary generated:', summary.substring(0, 100) + '...');

    // Step 3: Store audio file in Supabase Storage
    const supabase = createAdminClient();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `journal-audio/${userId}/${timestamp}-recording.webm`;

    const audioBuffer = await audioFile.arrayBuffer();
    const { data: storageData, error: storageError } = await supabase.storage
      .from('audio-files')
      .upload(fileName, audioBuffer, {
        contentType: audioFile.type,
        upsert: false
      });

    if (storageError) {
      console.error('Storage error:', storageError);
      return NextResponse.json(
        { error: 'Failed to store audio file' },
        { status: 500 }
      );
    }

    console.log('Audio stored at:', storageData.path);

    // Step 4: Save audio file metadata
    const { data: audioFileData, error: audioFileError } = await supabase
      .from('audio_files')
      .insert({
        user_id: userId,
        storage_path: storageData.path,
        mime_type: audioFile.type,
        duration_ms: null // Could be calculated from audio if needed
      })
      .select()
      .single();

    if (audioFileError) {
      console.error('Audio file DB error:', audioFileError);
      return NextResponse.json(
        { error: 'Failed to save audio metadata' },
        { status: 500 }
      );
    }

    // Step 5: Save transcript with summary
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .insert({
        user_id: userId,
        audio_id: audioFileData.id,
        text: `${transcription}\n\n--- SUMMARY ---\n${summary}`,
        language: 'en' // Could be detected from Whisper if needed
      })
      .select()
      .single();

    if (transcriptError) {
      console.error('Transcript DB error:', transcriptError);
      return NextResponse.json(
        { error: 'Failed to save transcript' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      transcription,
      summary,
      audioFileId: audioFileData.id,
      transcriptId: transcriptData.id
    });
  } catch (error) {
    console.error('Transcription error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API configuration error' },
          { status: 500 }
        );
      }
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error during transcription'
      },
      { status: 500 }
    );
  }
}
