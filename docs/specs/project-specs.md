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

### A1. Audio Journal Recording

**Purpose**: Enable voice-based journaling with automatic transcription and summarization.

**Functional Requirements**:

1. **Audio Recording**
   - Start/stop recording via button toggle
   - Maximum recording duration: 10 minutes
   - Microphone mute/unmute during recording
   - Temporary storage as Blob on server-side

2. **Speech-to-Text Processing**
   - API: Whisper-1 ($0.006/minute)
   - Convert audio Blob to text string
   - Return transcribed text to server

3. **AI Summarization**
   - Process raw transcription to:
     - Remove redundancies
     - Correct grammar
     - Structure content logically
   - Output format: Structured summary

4. **Data Persistence**
   - Audio files: Store in Supabase Storage at `journal-audio/*`
   - Transcribed text: Save to `user_journals` table
   - Include: original_audio_url, transcription, summary, timestamp

**Workflow**:
1. User initiates recording
2. System captures audio (max 10 min)
3. On stop: Process audio through Whisper API
4. Generate structured summary via AI
5. Display results for user confirmation
6. On save: Persist audio and text to database
