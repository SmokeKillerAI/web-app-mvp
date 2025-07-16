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

---

**Last Updated**: 2025-01-16  
**Maintainer**: Development Team  
**Next Review**: Monthly