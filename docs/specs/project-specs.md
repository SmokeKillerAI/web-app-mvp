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

### A0. Daily Mood Record

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

**Current Implementation**:

1. **Audio Recording** - Browser-based MediaRecorder API
   - Real-time duration display with progress bar
   - 10-minute max duration with auto-stop
   - webm/opus format support

2. **Processing Pipeline** - OpenAI Integration
   - Whisper-1 for speech-to-text ($0.006/minute)
   - GPT-4o-mini for intelligent summarization
   - 4-7 second average processing time

3. **Data Storage** - Leveraging existing infrastructure
   - Audio files in Supabase Storage (`audio-files` bucket)
   - Metadata in `audio_files` table
   - Transcripts + summaries in `transcripts` table

4. **User Interface** - Integrated with Overview page
   - "Voice Journal" button in dashboard header
   - Modal interface consistent with A0 design
   - Real-time stats display integration

**Technical Stack**: Next.js API routes, OpenAI SDK, Supabase admin client, Clerk authentication

**Next Steps**: Security enhancements, UI polish, multi-language support
