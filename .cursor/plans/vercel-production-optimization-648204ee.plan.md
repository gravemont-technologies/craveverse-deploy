<!-- 648204ee-b8d4-41b2-b623-313954ee14de afe32015-fc8f-45c3-85c5-50cf6a2f4df5 -->
# Fix Onboarding Loop Bug

## Problem Analysis

**Symptoms:**

- User completes onboarding successfully
- Clicks "Start My Journey" button
- Redirected back to onboarding screen
- Dashboard shows "Please complete your onboarding first"
- Infinite loop between onboarding completion and dashboard

**Root Causes Identified:**

1. User record may not exist in Supabase `users` table
2. Clerk webhook might not be creating users automatically
3. `clerk_user_id` field mismatch between Clerk and database
4. `primary_craving` field not being properly set or retrieved
5. Dashboard validation checking wrong field or timing issue

## Implementation Steps

### Phase 1: Database Verification

**Files:** Supabase Dashboard, `database/craveverse-schema.sql`

1. **Check Supabase `users` table structure**

- Verify `clerk_user_id` column exists
- Verify `primary_craving` column exists
- Check for any users created during sign-up

2. **Verify Clerk webhook is configured**

- Check `app/api/webhooks/clerk/route.ts`
- Ensure webhook creates user on `user.created` event
- Verify webhook URL is configured in Clerk dashboard

### Phase 2: Fix Clerk Webhook User Creation

**Files:** `app/api/webhooks/clerk/route.ts`

1. **Ensure user is created on sign-up**

- Handle `user.created` event
- Insert user with `clerk_user_id` = Clerk's `userId`
- Set default values for required fields
- Add error handling and logging

2. **Add fallback user creation**

- If webhook fails, create user on first API call
- Implement "get or create" pattern in profile routes

### Phase 3: Fix Onboarding Completion Flow

**Files:** `app/api/onboarding/complete/route.ts`, `lib/auth-utils.ts`

1. **Add user creation fallback in onboarding API**

- Check if user exists by `clerk_user_id`
- If not exists, create user before updating
- Ensure `primary_craving` is properly set
- Add comprehensive error logging

2. **Fix `hasCompletedOnboarding` check**

- Ensure it checks for actual data, not just field existence
- Add null/undefined safety checks
- Return proper boolean status

### Phase 4: Fix Dashboard Validation

**Files:** `app/dashboard/page.tsx`, `app/api/user/profile/route.ts`

1. **Improve dashboard onboarding check**

- Add explicit `primary_craving` validation
- Handle edge cases (null, empty string, undefined)
- Add loading states between checks

2. **Fix profile API response**

- Ensure `primary_craving` is included in response
- Handle cases where user exists but onboarding incomplete
- Return clear status indicators

### Phase 5: Add Debugging & Logging

**Files:** All affected route files

1. **Add console logging**

- Log user creation events
- Log onboarding completion steps
- Log dashboard validation checks
- Log database query results

2. **Add error boundaries**

- Catch and display helpful error messages
- Prevent silent failures
- Guide user on what to do next

### Phase 6: Local Testing

**Prerequisites:** Local environment with .env configured

1. **Test complete onboarding flow**

- Sign up new user
- Complete onboarding process
- Verify dashboard access
- Check database records

2. **Test edge cases**

- User exists without `primary_craving`
- Webhook fails during sign-up
- Network errors during onboarding
- Multiple onboarding attempts

### Phase 7: Vercel Deployment Fix

**Files:** Vercel environment variables

1. **Verify all environment variables are set**

- `CLERK_WEBHOOK_SECRET` configured
- Supabase credentials correct
- All required variables present

2. **Verify webhook is accessible**

- Clerk webhook URL points to production
- Webhook endpoint is public (not auth-protected)
- Webhook logs show successful events

## Success Criteria

- [ ] New user can sign up successfully
- [ ] User record is created in Supabase `users` table
- [ ] User can complete onboarding without errors
- [ ] Clicking "Start My Journey" redirects to dashboard
- [ ] Dashboard loads with user data visible
- [ ] No infinite redirect loops
- [ ] Process works locally and on Vercel

## Key Files to Modify

1. `app/api/webhooks/clerk/route.ts` - Fix user creation webhook
2. `app/api/onboarding/complete/route.ts` - Add user creation fallback
3. `app/api/user/profile/route.ts` - Improve profile retrieval
4. `app/dashboard/page.tsx` - Fix onboarding validation
5. `lib/auth-utils.ts` - Improve helper functions

## Rollback Plan

If issues persist:

1. Add temporary bypass for onboarding check
2. Allow all authenticated users to access dashboard
3. Show onboarding prompt in dashboard instead of blocking
4. Fix underlying issues without blocking user flow

### To-dos

- [ ] Delete test pages, temporary files, and Vite-related artifacts
- [ ] Remove redundant documentation files (6 files)
- [ ] Rewrite README.md with accurate CraveVerse information and local dev setup
- [ ] Rewrite DEPLOYMENT.md focused on Vercel deployment process
- [ ] Clean up package.json scripts and optimize for production
- [ ] Create vercel.json with optimal configuration
- [ ] Create .env.example and .env.production.local.example templates
- [ ] Remove unnecessary scripts, keep essential setup scripts
- [ ] Add API health check endpoint for monitoring
- [ ] Ensure .gitignore properly excludes all sensitive and build files
- [ ] Run build, type-check, and verify all changes work correctly