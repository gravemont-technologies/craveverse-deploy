<!-- 648204ee-b8d4-41b2-b623-313954ee14de 52ac4509-e1ac-46ba-b368-46eda6ddca9b -->
# Bulletproof Onboarding Architecture Refinement

## Root Cause Analysis

The emergency bypass is triggering because localStorage has `emergencyBypass: 'true'` set. The actual database connection works, but the flow has multiple architectural weaknesses:

1. **Clerk Webhook → Supabase sync is working** (creates user with `primary_craving: null`)
2. **Onboarding completion updates database** (sets `primary_craving`)
3. **Dashboard checks fail** because emergency bypass takes precedence
4. **No atomic transactions** - onboarding can partially fail
5. **No state management** - relies only on database polling

## Architectural Improvements

### Phase 1: Remove Emergency Bypass & Clean State

- Clear localStorage emergency flags from dashboard
- Remove all emergency bypass logic (lines 128-189 in `app/dashboard/page.tsx`)
- Add localStorage cleanup on dashboard mount
- Keep the emergency bypass button as opt-in only (not auto-triggered)

### Phase 2: Bulletproof Database Flow

- Fix `lib/auth-utils.ts` to use centralized supabase client (currently creates its own)
- Add transaction-like behavior to onboarding completion
- Implement optimistic UI updates with server reconciliation
- Add real-time database listeners for profile changes

### Phase 3: Enhanced Debugging System

- Create centralized logger utility with debug levels
- Add request tracing IDs across API calls
- Implement detailed flow tracking:
- Webhook receipt → User creation
- Onboarding start → Completion
- Dashboard mount → Profile fetch
- Add debug panel component (collapsible) showing:
- Current user state
- Recent API calls
- Database sync status
- Clerk session info

### Phase 4: Resilient Error Handling

- Never return 500 errors to frontend
- Always provide actionable fallbacks
- Add retry logic with exponential backoff
- Implement circuit breaker pattern for API calls

### Phase 5: State Management Refinement

- Add React Context for user profile state
- Implement SWR or React Query for data fetching
- Add optimistic updates for better UX
- Cache with proper invalidation strategies

## Implementation Steps

### Step 1: Fix auth-utils.ts Supabase Client

**File**: `lib/auth-utils.ts`

- Replace direct supabase client creation with centralized `supabaseServer`
- This fixes inconsistent database connections

### Step 2: Remove Emergency Bypass

**File**: `app/dashboard/page.tsx`

- Remove lines 128-189 (emergency bypass logic)
- Add `useEffect` to clear emergency localStorage on mount
- Keep normal onboarding redirect logic
- Add comprehensive console logging for debugging

### Step 3: Add Centralized Logger

**File**: `lib/logger.ts` (new)

- Create debug logger with trace IDs
- Levels: DEBUG, INFO, WARN, ERROR
- Format: `[TRACE_ID][COMPONENT][LEVEL] message`
- Export hooks: `useLogger()`, `createLogger()`

### Step 4: Add Debug Panel Component

**File**: `components/debug-panel.tsx` (new)

- Collapsible panel (top-right corner)
- Shows: User state, API calls, DB status, Clerk info
- Only visible in development or with `?debug=true`

### Step 5: Refactor Dashboard with Logging

**File**: `app/dashboard/page.tsx`

- Import and use centralized logger
- Add trace ID to all API calls
- Log each decision point
- Add debug panel integration

### Step 6: Refactor Onboarding with Logging

**File**: `app/onboarding/page.tsx`

- Add centralized logger
- Add trace ID propagation
- Log each step completion
- Add retry logic with better UX

### Step 7: Enhance API Routes

**Files**:

- `app/api/user/profile/route.ts`
- `app/api/onboarding/complete/route.ts`
- `app/api/onboarding/personalize/route.ts`

Changes:

- Add request trace IDs from headers
- Use centralized logger
- Never return 500 (return 200 with error flag)
- Add detailed logging at each step

### Step 8: Add User Context Provider

**File**: `contexts/user-context.tsx` (new)

- React Context for user profile
- Automatic refresh on visibility change
- Optimistic updates
- Real-time sync status

### Step 9: Clean Up Debug Endpoints

**Keep**: `/api/health`, `/api/debug/env-check`, `/api/debug/db-schema`
**Remove**: `/api/debug/setup-db`, `/api/debug/user-state` (move to debug panel)

### Step 10: Test & Deploy

- Test complete flow with debug panel
- Verify all logging works
- Test error scenarios
- Deploy to production
- Monitor logs for any issues

## Key Files Modified

1. `lib/auth-utils.ts` - Fix supabase client
2. `lib/logger.ts` - NEW: Centralized logging
3. `lib/supabase-client.ts` - Export additional utilities
4. `components/debug-panel.tsx` - NEW: Debug UI
5. `contexts/user-context.tsx` - NEW: State management
6. `app/dashboard/page.tsx` - Remove bypass, add logging
7. `app/onboarding/page.tsx` - Add logging, improve flow
8. `app/api/user/profile/route.ts` - Enhanced logging
9. `app/api/onboarding/complete/route.ts` - Enhanced logging
10. `app/api/onboarding/personalize/route.ts` - Enhanced logging

## Expected Outcome

- No more emergency bypass activation
- Clear visibility into entire flow via debug panel
- Resilient error handling with graceful degradation
- Optimistic UI updates for better UX
- Production-ready logging for debugging
- Onboarding completes successfully every time

### To-dos

- [ ] Pull latest repository changes and verify codebase state
- [ ] Map complete authentication and onboarding flow across all files
- [ ] Create temporary /api/debug/user-state endpoint for diagnostics
- [ ] Test complete sign-up and onboarding flow locally with detailed logging
- [ ] Analyze console logs and identify exact failure point
- [ ] Implement specific fix for identified root cause
- [ ] Test the fix locally and verify no existing features break
- [ ] Remove temporary debug endpoint and console logs