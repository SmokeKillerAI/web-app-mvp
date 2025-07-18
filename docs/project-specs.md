## Implementation Phases & Data Flow

**IMPORTANT**: The current implementation phase focuses on Module A (Daily Record) with data flowing to relational database only. The RAG system (vector database, knowledge graph, AI agent) will be implemented in later phases.

**Current Phase**: 
- Module A data flows to Supabase Postgres tables only
- No RAG integration, vector embeddings, or AI processing

**Future Phase - RAG Integration**:
- When RAG module implementation begins, Module A will undergo partial refactoring
- Data will be duplicated/synced to vector database and knowledge graph
- AI agent will process existing Module A data for semantic understanding

---

## Module A: Daily Record

### A0. Daily Mood Record ✅ *Implemented*

**Purpose**: Capture user's daily emotional state through structured questionnaires.

**Functional Requirements**:

1. **Data Collection Interface**
   - Display modal popup on user login if no entry exists for current date
   - Present two questions simultaneously:
     ```
     Question 1 (Single Choice):
     - "How was your day?"
       - Good day
       - Bad day  
       - Just so so
     
     Question 2 (Multiple Choice):
     - "How do you feel today?"
       - Happy
       - Anxious
       - Anger
       - Sadness
       - Despair
       - [Additional emotions as needed]
     ```

2. **Business Logic**
   - Check `daily_question` table for existing entry with current date and user_id
   - **Auto-trigger**: Modal automatically displays on dashboard/overview page load when no daily entry exists
   - **Manual trigger**: "Daily Check-in" button available on overview page to open modal anytime
   - **Update support**: If user has already submitted today, allow updating existing entry
   - **Smart form behavior**:
     - New entry mode: Empty form, "Submit" button
     - Update mode: Pre-populated with existing data, "Update" button

3. **Data Storage**
   - Table: `daily_question`
   - **Create operation**: INSERT new record when no daily entry exists
   - **Update operation**: UPDATE existing record by ID when daily entry exists
   - **Data integrity**: One record per user per day maintained

4. **UI Specifications**
   - Location: `/dashboard/overview`
   - Component: Centered modal overlay
   - **Manual trigger**: "Daily Check-in" button with heart icon in overview page header
   - **Button states**: 
     - Loading: "Submitting..." / "Updating..."
     - Normal: "Submit" / "Update"
   - **Dynamic display**: "Mood Today" card shows real-time mood data
   - Style: Consistent with project design system

5. **Technical Implementation**
   - **Component architecture**: forwardRef pattern for external triggering
   - **Event communication**: CustomEvent system between page and layout
   - **State management**: Local component state with mode tracking
   - **Database operations**: Conditional INSERT/UPDATE logic
   - **Dynamic display**: Real-time mood data fetching with loading states

### A1. Audio Journal Recording ✅ *Implemented*

**Purpose**: Enable voice-based journaling with automatic transcription and summarization.

**Functional Requirements**:

1. **Data Collection Interface**
   - Browser-based MediaRecorder API with webm/opus format
   - Real-time duration display with visual progress bar
   - 10-minute maximum duration with automatic stop
   - Record/stop controls with clear visual feedback
   - Audio playback functionality for recorded content

2. **Business Logic**
   - **Audio Processing Pipeline**:
     - Transcription: OpenAI Whisper-1 API ($0.006/minute)
     - Summarization: GPT-4o-mini for content structuring
     - Processing time: 4-7 seconds average
   - **File Management**:
     - Maximum file size: 25MB (API limitation)
     - Storage path structure: `journal-audio/[user-id]/[timestamp]-recording.webm`

3. **Data Storage**
   - Table: `audio_files`
     - Stores: user_id, storage_path, mime_type, duration_ms
   - Table: `transcripts`
     - Stores: user_id, audio_id (FK), text, language
   - Storage: Supabase Storage bucket `audio-files`
   - **Data integrity**: Each audio file linked to its transcript

4. **UI Specifications**
   - Location: `/dashboard/overview` (embedded panel, right column)
   - Component: AudioJournalPanel (no modal, direct integration)
   - **Design**: Clean interface following "Intelligent Minimalism"
   - **Visual hierarchy**: Central focus with two-column layout
   - **Real-time stats**: Display total entries, weekly count, streak

5. **Technical Implementation**
   - **API endpoint**: `/api/transcribe` with multipart form data
   - **Authentication**: Clerk user verification required
   - **Admin access**: Service role key for RLS bypass
   - **Error handling**: Comprehensive error responses
   - **Event system**: CustomEvent for cross-component updates


### A2. [Planned] AI-Powered Insights

**Purpose**: Generate intelligent insights from journal entries using AI analysis.

**Status**: 🔄 Planned - Not implemented

---

## Module B: [Future] Social Features

**Status**: 📋 Future module - Not in current roadmap

---

## Module C: [Future] Analytics & Insights  

**Status**: 📋 Future module - Not in current roadmap