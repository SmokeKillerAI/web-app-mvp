# Troubleshooting Guide

## Common Development Issues and Solutions

### Next.js Development Issues

#### 1. Build Cache Corruption
**Error**: 
```
Error: ENOENT: no such file or directory, open '/path/to/.next/static/development/_buildManifest.js.tmp.xxxxx'
```

**Cause**: Next.js cache corruption during development, often occurs when:
- Multiple files are modified simultaneously
- Development server is forcefully terminated
- File system permissions issues

**Solution**:
```bash
# Quick fix
rm -rf .next
pnpm dev

# Complete clean (if problem persists)
rm -rf .next node_modules
pnpm install
pnpm dev
```

**Prevention**:
- Use proper shutdown procedures (Ctrl+C)
- Avoid rapid file modifications during build
- Ensure proper file system permissions

#### 2. Port Conflicts
**Error**: 
```
⚠ Port 3000 is in use, using available port 3001 instead
```

**Cause**: Another process is using the default port 3000

**Solution**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use alternative port
pnpm dev --port 3001
```

### React Development Issues

#### 1. Client Component Event Handlers
**Error**: 
```
Error: Event handlers cannot be passed to Client Component props
```

**Cause**: Server components cannot pass event handlers to client components

**Solution**:
```typescript
// Add 'use client' directive to components with event handlers
'use client';

import { Button } from '@/components/ui/button';

export default function MyComponent() {
  return (
    <Button onClick={() => console.log('clicked')}>
      Click me
    </Button>
  );
}
```

#### 2. Missing Key Props in Lists
**Error**: 
```
Each child in a list should have a unique "key" prop
```

**Cause**: React requires unique keys for list items to optimize rendering

**Solution**:
```typescript
// Bad
{items.map((item) => (
  <div>{item.name}</div>
))}

// Good
{items.map((item) => (
  <div key={item.id}>{item.name}</div>
))}

// For arrays without unique IDs
{items.map((item, index) => (
  <div key={`item-${index}`}>{item.name}</div>
))}
```

#### 3. React Hook Dependencies
**Error**: 
```
React Hook useEffect has a missing dependency: 'functionName'
```

**Cause**: useEffect depends on variables that aren't in the dependency array

**Solution**:
```typescript
// Use useCallback for stable function references
const stableFunction = useCallback(() => {
  // function logic
}, [dependencies]);

useEffect(() => {
  stableFunction();
}, [stableFunction]);
```

### TypeScript Issues

#### 1. Strict Type Checking
**Error**: 
```
'props' is declared but its value is never read
```

**Solution**:
```typescript
// Use underscore for unused parameters
const MyComponent = forwardRef<RefType, Props>((_props, ref) => {
  // component logic
});

// Or destructure only needed props
const MyComponent = ({ neededProp, ...rest }: Props) => {
  // component logic
};
```

### Database Issues

#### 1. Supabase RLS Policies
**Error**: 
```
new row violates row-level security policy for table "daily_question"
```

**Cause**: Row Level Security (RLS) policies are not properly configured

**Solution**:
```sql
-- Enable RLS
ALTER TABLE daily_question ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can manage their own records" ON daily_question
  FOR ALL USING (auth.uid()::text = user_id);
```

#### 2. Date Filtering Issues
**Problem**: Queries not returning expected results for "today's" data

**Cause**: Timezone differences between client and server

**Solution**:
```typescript
// Use consistent date formatting
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const { data, error } = await supabase
  .from('daily_question')
  .select('*')
  .eq('user_id', user.id)
  .gte('created_at', today)
  .lt('created_at', tomorrow)
  .single();
```

### Authentication Issues

#### 1. Clerk Session Management
**Error**: 
```
user is undefined in useUser hook
```

**Cause**: Component renders before Clerk authentication initializes

**Solution**:
```typescript
const { user, isLoaded } = useUser();

if (!isLoaded) {
  return <div>Loading...</div>;
}

if (!user) {
  return <div>Please sign in</div>;
}
```

### Performance Issues

#### 1. Unnecessary Re-renders
**Problem**: Components re-render too frequently

**Solution**:
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler logic
}, [dependency]);

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

### Build and Deployment Issues

#### 1. Environment Variables
**Error**: 
```
NEXT_PUBLIC_SUPABASE_URL is not defined
```

**Solution**:
```bash
# Ensure .env.local exists and contains required variables
cp env.example.txt .env.local

# Edit .env.local with your values
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

#### 2. TypeScript Build Errors
**Error**: 
```
Type error: Cannot find module '@/components/ui/button'
```

**Solution**:
```bash
# Regenerate TypeScript types
pnpm supabase:generate-types

# Check TypeScript configuration
npx tsc --showConfig

# Clear TypeScript cache
rm -rf node_modules/.cache
```

### Testing Issues

#### 1. Component Testing Setup
**Problem**: Components with hooks fail in tests

**Solution**:
```typescript
// Wrap components with required providers
import { render } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';

const renderWithProviders = (component) => {
  return render(
    <ClerkProvider>
      {component}
    </ClerkProvider>
  );
};
```

## Debugging Tools and Techniques

### React Developer Tools
- Install React DevTools browser extension
- Use Profiler to identify performance bottlenecks
- Inspect component props and state

### Network Debugging
```typescript
// Log Supabase queries
const { data, error } = await supabase
  .from('daily_question')
  .select('*')
  .eq('user_id', user.id);

console.log('Supabase query:', { data, error });
```

### Error Boundary Setup
```typescript
// Create error boundary for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

## Best Practices

### Code Organization
- Use feature-based folder structure
- Keep components small and focused
- Extract custom hooks for reusable logic
- Use TypeScript for better type safety

### Performance
- Implement proper loading states
- Use React.memo for expensive components
- Implement proper error boundaries
- Optimize database queries

### Security
- Always validate user input
- Use proper authentication checks
- Implement RLS policies in Supabase
- Never expose sensitive data in client-side code

## Audio Journal Recording Issues

### Microphone Permission Denied
**Error**: 
```
Unable to access microphone. Please check permissions.
```

**Solution**:
1. Browser level: Check site permissions in browser settings
2. System level: Ensure browser has microphone access in OS settings
3. HTTPS requirement: MediaRecorder requires secure context (HTTPS or localhost)

### Recording Not Starting
**Problem**: Click record button but nothing happens

**Causes & Solutions**:
- Check browser compatibility (Chrome/Edge/Firefox recommended)
- Ensure microphone is not in use by another application
- Check console for specific MediaRecorder errors

### Audio Playback Issues
**Problem**: Recorded audio won't play

**Solution**:
```typescript
// Ensure proper MIME type support
const options = {
  mimeType: 'audio/webm;codecs=opus' // Primary choice
};

// Fallback options
if (!MediaRecorder.isTypeSupported(options.mimeType)) {
  options.mimeType = 'audio/webm';
}
```

## Supabase Storage Issues

### Storage Bucket Not Found
**Error**: 
```
Storage error: {
  statusCode: '404',
  error: 'Bucket not found',
  message: 'Bucket not found'
}
```

**Solution**:
1. Create bucket in Supabase Dashboard:
   - Navigate to Storage section
   - Create bucket named `audio-files`
   - Set appropriate permissions (public/private)

### RLS Policy Violations
**Error**: 
```
new row violates row-level security policy
```

**Solutions**:

1. **For Clerk + Supabase**: Use service role key in API routes
```typescript
// Create admin client for bypassing RLS
import { createAdminClient } from '@/lib/supabase/admin';
const supabase = createAdminClient();
```

2. **Disable RLS** (development only):
```sql
ALTER TABLE audio_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts DISABLE ROW LEVEL SECURITY;
```

3. **Configure proper RLS** (production):
```sql
-- Since using Clerk auth, policies need custom implementation
-- Consider using service role key for authenticated operations
```

### File Upload Size Limits
**Error**: 
```
File too large
```

**Solution**:
- Whisper API limit: 25MB
- Configure Supabase bucket limit accordingly
- Implement client-side validation:
```typescript
const maxSize = 25 * 1024 * 1024; // 25MB
if (audioFile.size > maxSize) {
  return NextResponse.json({ error: 'File too large' }, { status: 400 });
}
```

## OpenAI API Issues

### Missing API Key
**Error**: 
```
OpenAI API configuration error
```

**Solution**:
1. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-proj-****
```
2. Restart development server

### API Quota Exceeded
**Error**: 
```
API quota exceeded
```

**Solutions**:
- Check OpenAI dashboard for usage limits
- Implement rate limiting in your application
- Consider queuing system for high traffic

### Transcription Failures
**Problem**: Whisper API returns empty or incorrect transcription

**Solutions**:
1. Verify audio quality and format
2. Check language settings
3. Ensure audio contains speech (not silence)
4. Handle edge cases:
```typescript
if (!transcription || transcription.trim().length === 0) {
  return NextResponse.json({ error: 'No speech detected in audio' }, { status: 400 });
}
```

### GPT Summarization Issues
**Problem**: Summary not generating or too generic

**Solution**: Refine system prompt
```typescript
const systemPrompt = `You are a helpful assistant that summarizes personal journal entries. 
Create a concise, structured summary that:
- Removes redundancies and filler words
- Corrects grammar while preserving the original meaning
- Highlights key themes and emotions
- Aims for 2-3 sentences maximum`;
```

## Integration Issues

### Event System Not Working
**Problem**: Modal not opening when button clicked

**Solution**: Verify event listener setup
```typescript
// In layout component
useEffect(() => {
  const handleOpenModal = () => {
    modalRef.current?.openModal();
  };
  
  window.addEventListener('openAudioJournalModal', handleOpenModal);
  return () => {
    window.removeEventListener('openAudioJournalModal', handleOpenModal);
  };
}, []);
```

### Stats Not Updating
**Problem**: Audio journal stats remain at 0

**Solutions**:
1. Check database queries are returning data
2. Verify user ID matching between Clerk and database
3. Ensure proper date filtering in queries
4. Check for event dispatching after successful save:
```typescript
const event = new CustomEvent('audioJournalUpdated');
window.dispatchEvent(event);
```

### Type Errors with Supabase
**Problem**: TypeScript errors with query results

**Solution**: Ensure types match actual query structure
```typescript
// Define custom types for joined queries
type AudioJournalWithTranscript = Tables<'audio_files'> & {
  transcripts: {
    id: string;
    text: string | null;
    language: string | null;
    created_at: string | null;
  }[];
};
```

## Performance Optimization

### Slow Transcription Processing
**Problem**: API takes too long to respond

**Solutions**:
1. Show proper loading states
2. Implement progress indicators
3. Consider audio compression before upload
4. Add timeout handling:
```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout
```

### Memory Leaks with Audio Blobs
**Problem**: Browser memory usage increases

**Solution**: Clean up audio URLs
```typescript
useEffect(() => {
  return () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };
}, [audioUrl]);
```

---

**Last Updated**: 2025-01-17  
**Maintainer**: Development Team  
**Next Review**: Monthly