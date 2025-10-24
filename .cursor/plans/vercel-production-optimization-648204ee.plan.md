<!-- 648204ee-b8d4-41b2-b623-313954ee14de d13461e2-1ed3-4cf8-8e9e-8af8e5ca822a -->
# Reform Repository Architecture - Eliminate Onboarding Loop

## Root Cause Analysis

The onboarding loop occurs because:

1. **Dashboard checks `!userProfile`** (line 128) and redirects to onboarding
2. **API route `/api/user/profile`** returns 500 errors when OpenAI/database issues occur
3. **Onboarding completion** depends on multiple API calls that can fail silently
4. **No fallback UI** when user profile exists but `primary_craving` is null

## Reform Strategy

### Phase 1: Simplify Onboarding Flow (Critical Path)

**Problem**: Onboarding depends on 3 API calls that can each fail:

- `/api/user/profile` - Can return 500
- `/api/onboarding/personalize` - Depends on OpenAI
- `/api/onboarding/complete` - Updates database

**Solution**: Make onboarding work WITHOUT external dependencies

1. **Remove AI personalization requirement**

            - Make `/api/onboarding/personalize` entirely optional
            - Store quiz answers directly without AI processing
            - Use hardcoded welcome messages by default
            - AI personalization becomes a "nice-to-have" enhancement

2. **Simplify `/api/onboarding/complete`**

            - Only require: `craving` selection
            - Set `primary_craving` immediately in database
            - Remove dependency on personalization data
            - Return success even if AI fails

3. **Fix dashboard redirect logic**

            - Change line 128: Check `!userProfile?.primary_craving` instead of `!userProfile`
            - Add explicit state: `onboardingIncomplete` vs `profileMissing`
            - Show different UI for each case

### Phase 2: Make APIs Resilient

1. **`/api/user/profile`** - Never return 500
   ```typescript
         - If user not found: Create minimal profile
         - If levels fail: Return user with null level
         - Always return 200 with whatever data exists
   ```

2. **`/api/onboarding/complete`** - Always succeed
   ```typescript
         - Minimum requirement: Update primary_craving
         - Everything else is optional (preferences, AI summary)
         - Return 200 even if partial update
   ```

3. **`/api/onboarding/personalize`** - Make truly optional
   ```typescript
         - If OpenAI unavailable: Return immediately with defaults
         - Don't throw errors, always return fallback
         - Frontend should work without calling this at all
   ```


### Phase 3: Delegate Complex Features

1. **AI Features** - External service approach

            - Move AI to background jobs (don't block onboarding)
            - Use simple templates initially
            - Enhance with AI later (async)

2. **Level System** - Simplify initial experience

            - Start all users at Level 1 with default content
            - Don't fetch from database during onboarding
            - Lazy-load levels on dashboard

3. **Personalization** - Client-side only initially

            - Store quiz answers locally
            - Display generic encouragement
            - Process with AI in background (optional)

### Phase 4: Add Robust Error Boundaries

1. **Dashboard Error Handling**
   ```typescript
   if (profileError) {
     // Show "Complete Setup" button
     // Don't auto-redirect to onboarding
   }
   ```

2. **Onboarding Error Handling**
   ```typescript
   if (completeError) {
     // Retry with minimal data
     // Skip optional features
     // Force completion with defaults
   }
   ```

3. **Loading States**

            - Add timeout (10s max)
            - Show "Skip" buttons for optional steps
            - Allow manual progression

## Implementation Plan

### Step 1: Emergency Fix (Immediate)

- Modify dashboard to NOT redirect if `userProfile` exists but `primary_craving` is null
- Show "Complete Onboarding" button instead
- This breaks the loop immediately

### Step 2: Simplify Onboarding (High Priority)

- Make Step 3 (personalization) skippable
- Allow completing onboarding with just craving selection
- Remove AI dependency from critical path

### Step 3: Harden APIs (Medium Priority)

- Add try-catch to every API route
- Always return 200 or 503 (never 500)
- Log errors but don't crash

### Step 4: Background Enhancements (Low Priority)

- Move AI processing to background
- Add job queue for personalization
- Enhance experience without blocking

## Success Criteria

1. ✅ New user can complete onboarding without any API calls succeeding
2. ✅ Dashboard never enters infinite redirect loop
3. ✅ App works 100% without OpenAI configured
4. ✅ All features still accessible (just simpler initially)
5. ✅ No 500 errors from any API route

## Files to Modify

1. **`app/dashboard/page.tsx`** - Fix redirect logic (lines 128-139)
2. **`app/onboarding/page.tsx`** - Make personalization optional
3. **`app/api/onboarding/complete/route.ts`** - Simplify requirements
4. **`app/api/onboarding/personalize/route.ts`** - Return defaults immediately
5. **`app/api/user/profile/route.ts`** - Never return 500
6. **`lib/auth-utils.ts`** - Add fallback user creation

## Preserved Features

- ✅ All existing functionality remains
- ✅ AI features work when configured
- ✅ Level system intact
- ✅ Battle system intact
- ✅ Forum system intact
- ✅ Payment system intact

## What Changes

- ❌ AI no longer blocks onboarding
- ❌ Complex validation removed
- ❌ Fewer database queries required
- ✅ Simpler, more reliable flow
- ✅ Better error handling
- ✅ Faster user experience

### To-dos

- [ ] Pull latest repository changes and verify codebase state
- [ ] Map complete authentication and onboarding flow across all files
- [ ] Create temporary /api/debug/user-state endpoint for diagnostics
- [ ] Test complete sign-up and onboarding flow locally with detailed logging
- [ ] Analyze console logs and identify exact failure point
- [ ] Implement specific fix for identified root cause
- [ ] Test the fix locally and verify no existing features break
- [ ] Remove temporary debug endpoint and console logs
- [ ] Deploy fixes to Vercel and monitor build
- [ ] Test complete onboarding flow in production environment