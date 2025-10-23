<!-- 648204ee-b8d4-41b2-b623-313954ee14de 3ec9d59e-0406-4a7b-942f-c09a216e504a -->
# Local Testing & Debugging Plan

## 1. Environment Setup & Validation

**Check existing environment files:**

- Read `.env` and `.env.local` to see what credentials are available
- Verify all required environment variables are present
- Test database connectivity with existing credentials

**If credentials missing:**

- User needs to provide actual Supabase, Clerk, OpenAI, Stripe credentials
- Or we proceed with mock/placeholder mode for testing UI only

## 2. Fix Build Issues

**Resolve Supabase client initialization:**

- Fix the circular dependency in `lib/supabase-client.ts`
- Ensure mock client works properly when credentials are missing
- Make build succeed without requiring live credentials

**Fix empty sign-in/sign-up pages:**

- Already fixed, but verify they work

## 3. Start Development Server

**Run local server:**

```bash
npm run dev
```

**Verify server starts:**

- Check for any startup errors
- Confirm port 3000 is accessible
- Test landing page loads

## 4. Systematic Frontend Testing Strategy

### Phase A: Public Pages (No Auth Required)

**Landing Page (`/`):**

- [ ] Page loads without errors
- [ ] All sections render correctly
- [ ] Navigation links work
- [ ] CTA buttons respond

**Pricing Page (`/pricing`):**

- [ ] All tiers display correctly
- [ ] Pricing information accurate
- [ ] Subscribe buttons work (redirect to sign-up)

### Phase B: Authentication Flow

**Sign Up (`/sign-up`):**

- [ ] Clerk sign-up component loads
- [ ] Can create test account
- [ ] Redirects after successful sign-up

**Sign In (`/sign-in`):**

- [ ] Clerk sign-in component loads
- [ ] Can sign in with test account
- [ ] Redirects to dashboard after login

### Phase C: Onboarding Flow

**Onboarding (`/onboarding`):**

- [ ] Craving selector displays
- [ ] Can select craving type
- [ ] Quiz questions load
- [ ] Can submit answers
- [ ] API: `POST /api/onboarding/complete` works
- [ ] API: `POST /api/onboarding/personalize` works
- [ ] Redirects to dashboard after completion

### Phase D: Dashboard & Core Features

**Dashboard (`/dashboard`):**

- [ ] User stats display correctly
- [ ] Recent activity loads
- [ ] Quick actions work
- [ ] Trial banner shows (if applicable)
- [ ] API: `GET /api/user/profile` works

**Levels System:**

- [ ] Level cards display
- [ ] Can click to view level details
- [ ] Can complete a level
- [ ] API: `POST /api/levels/complete` works
- [ ] XP and coins update correctly

### Phase E: Battle System

**Battles Page (`/battles`):**

- [ ] Active battles display
- [ ] Can create new battle
- [ ] API: `POST /api/battles` works
- [ ] API: `GET /api/battles` works
- [ ] API: `GET /api/battles/stats` works

**Battle Detail (`/battles/[battleId]`):**

- [ ] Battle details load
- [ ] Tasks display correctly
- [ ] Can complete tasks
- [ ] API: `POST /api/battles/tasks/complete` works
- [ ] Timer updates in real-time
- [ ] Battle results show correctly

### Phase F: Forum System

**Forum Page (`/forum`):**

- [ ] Thread list displays
- [ ] Can filter threads
- [ ] Can create new thread
- [ ] API: `GET /api/forum/threads` works
- [ ] API: `POST /api/forum/threads` works

**Thread Detail (`/forum/[threadId]`):**

- [ ] Thread content loads
- [ ] Replies display
- [ ] Can post reply
- [ ] Can upvote
- [ ] API: `GET /api/forum/threads/[threadId]` works
- [ ] API: `POST /api/forum/replies` works
- [ ] API: `POST /api/forum/upvote` works
- [ ] API: `POST /api/forum/suggest-reply` works (AI)

### Phase G: Leaderboard & Progress

**Leaderboard (`/leaderboard`):**

- [ ] Rankings display
- [ ] User position shows
- [ ] Filters work
- [ ] API: `GET /api/leaderboard` works

**Progress Page (`/progress/[userId]`):**

- [ ] User progress loads
- [ ] Charts display correctly
- [ ] Stats are accurate

### Phase H: Admin Features

**Admin Dashboard (`/admin`):**

- [ ] Only accessible to admin users
- [ ] Metrics display
- [ ] API: `GET /api/admin/metrics` works

### Phase I: Payment & Subscription

**Trial System:**

- [ ] Can start trial
- [ ] API: `POST /api/trial/start` works
- [ ] Trial banner updates

**Stripe Integration:**

- [ ] Can create checkout session
- [ ] API: `POST /api/stripe/create-checkout-session` works
- [ ] Webhook endpoint exists: `POST /api/stripe/webhook`

### Phase J: Webhooks & Background

**Clerk Webhook:**

- [ ] Endpoint exists: `POST /api/webhooks/clerk`
- [ ] Handles user.created event
- [ ] Handles user.updated event
- [ ] Handles user.deleted event

**Health Check:**

- [ ] API: `GET /api/health` works
- [ ] Returns proper status
- [ ] Shows service health

## 5. Testing Execution Strategy

**Quick Testing Approach:**

1. **Automated API Testing** (5 min)

   - Use curl/Postman to test all API endpoints
   - Check response codes and data structure

2. **Manual UI Testing** (15 min)

   - Follow user journey: Sign up → Onboarding → Dashboard → Features
   - Test one feature from each category
   - Focus on critical path

3. **Error Testing** (5 min)

   - Test with invalid data
   - Test unauthorized access
   - Test missing parameters

## 6. Debug & Fix Issues

**For each failing test:**

- Identify the error in console/logs
- Fix the root cause
- Re-test to confirm fix
- Document the fix

**Common issues to watch for:**

- Missing environment variables
- Database connection errors
- Authentication/authorization failures
- API endpoint errors
- Type errors
- Missing dependencies

## 7. Final Validation

**Before pushing to repo:**

- [ ] All critical features work
- [ ] No console errors on main pages
- [ ] Authentication flow complete
- [ ] At least one feature from each category works
- [ ] Build succeeds: `npm run build`
- [ ] Type check passes: `npm run type-check`

## 8. Push to Repository

```bash
git add .
git commit -m "Production-ready: All features tested and working"
git push origin main
```

## Testing Priority Levels

**P0 (Critical - Must Work):**

- Authentication (sign up/sign in)
- Dashboard loads
- One level completion
- Health check endpoint

**P1 (High - Should Work):**

- Onboarding flow
- Battle creation
- Forum thread creation
- Leaderboard display

**P2 (Medium - Nice to Have):**

- AI features
- Admin dashboard
- Payment flow
- Advanced filtering

## Expected Timeline

- Environment setup: 2 min
- Fix build issues: 5 min
- Start server: 1 min
- P0 testing: 5 min
- P1 testing: 10 min
- P2 testing: 5 min
- Debug & fixes: 10 min
- Final validation: 2 min

**Total: ~40 minutes**

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