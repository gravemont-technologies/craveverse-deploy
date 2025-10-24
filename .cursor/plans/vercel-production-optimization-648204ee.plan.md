<!-- 648204ee-b8d4-41b2-b623-313954ee14de a2be94dc-dfbf-44ef-b8aa-da0e207d74ac -->
# Rigorous Local Testing Plan - Verify Onboarding Loop Fix

## Testing Philosophy

**DO NOT CLAIM SUCCESS UNTIL:**
1. All test scenarios pass locally
2. Every edge case is verified
3. API failures are simulated and handled
4. User flows are documented with evidence
5. Regression testing shows no broken features

## Test Scenarios

### Scenario 1: Fresh User Sign-Up (Happy Path)
**Steps:**
1. Clear browser cache and cookies
2. Sign up with new email
3. Verify Clerk creates user
4. Complete onboarding step-by-step
5. Verify redirect to dashboard
6. Verify no loop back to onboarding

**Expected:**
- User completes onboarding successfully
- Dashboard loads with user data
- No redirect loop

**Evidence Required:**
- Console logs showing each step
- Screenshots of each page
- Database state after completion

### Scenario 2: API Personalization Fails
**Steps:**
1. Sign up new user
2. Select craving
3. Complete quiz
4. Click "Skip Personalization"
5. Complete onboarding
6. Verify dashboard loads

**Expected:**
- Onboarding completes with defaults
- No errors in console
- Dashboard shows default messages

**Evidence Required:**
- Console logs showing skip action
- Verification of default data used

### Scenario 3: User Profile Doesn't Exist
**Steps:**
1. Simulate scenario where Clerk webhook fails
2. User tries to access dashboard
3. Verify fallback profile creation
4. Complete onboarding
5. Verify dashboard loads

**Expected:**
- Minimal profile created automatically
- Onboarding works normally
- No 500 errors

**Evidence Required:**
- API logs showing fallback creation
- Database state verification

### Scenario 4: Onboarding Completion API Fails
**Steps:**
1. Start onboarding
2. Simulate `/api/onboarding/complete` returning error
3. Verify error handling
4. Retry completion
5. Verify success or fallback

**Expected:**
- User sees error message
- Retry option available
- System doesn't crash

**Evidence Required:**
- Error handling logs
- User experience screenshots

### Scenario 5: User Has Profile But No primary_craving
**Steps:**
1. Manually set user profile with `primary_craving: null`
2. Access dashboard
3. Verify NO redirect loop
4. Click "Complete Onboarding"
5. Finish onboarding
6. Verify dashboard loads

**Expected:**
- Dashboard shows setup prompt
- No infinite redirect
- "Try Again" button works

**Evidence Required:**
- Console logs showing state
- No redirect loop observed

### Scenario 6: All APIs Return Errors
**Steps:**
1. Simulate all API routes returning errors
2. Attempt onboarding
3. Verify fallback data used
4. Verify user can still proceed
5. Verify dashboard eventually loads

**Expected:**
- App doesn't crash
- Fallback data everywhere
- User can complete basic flow

**Evidence Required:**
- All API error logs
- Proof of fallback usage

### Scenario 7: OpenAI API Key Missing
**Steps:**
1. Remove `OPENAI_API_KEY` from `.env`
2. Restart dev server
3. Complete onboarding
4. Verify AI features skip gracefully
5. Verify dashboard loads

**Expected:**
- No build errors
- No runtime crashes
- Fallback messages used

**Evidence Required:**
- Build logs
- Runtime logs
- Dashboard functionality

### Scenario 8: Database Connection Issues
**Steps:**
1. Temporarily use wrong Supabase credentials
2. Attempt onboarding
3. Verify error handling
4. Verify no crashes
5. Fix credentials and retry

**Expected:**
- Clear error messages
- No white screen of death
- Recovery possible

**Evidence Required:**
- Error handling logs
- User experience flow

## Testing Checklist

### Pre-Test Setup
- [ ] Pull latest code from GitHub
- [ ] Verify `.env` has all required variables
- [ ] Clear browser cache/cookies
- [ ] Restart dev server
- [ ] Check Supabase database is accessible

### During Testing
- [ ] Record console logs for each scenario
- [ ] Take screenshots at each step
- [ ] Document any errors encountered
- [ ] Note response times and performance
- [ ] Check network tab for API calls

### Post-Test Verification
- [ ] All 8 scenarios pass
- [ ] No console errors in any scenario
- [ ] Database state correct after each test
- [ ] No redirect loops observed
- [ ] All features still functional

## Regression Testing

### Features That Must Still Work
1. **Authentication:**
   - [ ] Sign up works
   - [ ] Sign in works
   - [ ] Sign out works
   - [ ] Session persists

2. **Onboarding:**
   - [ ] Craving selection works
   - [ ] Quiz completion works
   - [ ] Personalization (optional) works
   - [ ] Final completion works

3. **Dashboard:**
   - [ ] User profile displays
   - [ ] Current level shows
   - [ ] Stats are accurate
   - [ ] Navigation works

4. **Level System:**
   - [ ] Levels load correctly
   - [ ] Level completion works
   - [ ] XP/coins awarded
   - [ ] Progress tracked

5. **AI Features (when configured):**
   - [ ] Level feedback generates
   - [ ] Forum replies suggest
   - [ ] Personalization works
   - [ ] All fallbacks work

## Success Criteria

### ONLY CLAIM SUCCESS IF:
1. ✅ All 8 test scenarios pass without errors
2. ✅ No redirect loops in any scenario
3. ✅ All regression tests pass
4. ✅ API failures are handled gracefully
5. ✅ User can complete onboarding even with failures
6. ✅ Dashboard loads in all scenarios
7. ✅ No console errors or warnings
8. ✅ Database state is correct

## Evidence Documentation

### Required Documentation:
1. **Test Run Log**: Timestamp and results for each scenario
2. **Console Logs**: Full logs for each test scenario
3. **Screenshots**: Key pages from each user flow
4. **Database Snapshots**: State before/after each test
5. **API Call Logs**: Network tab captures
6. **Error Logs**: Any errors encountered and how handled

## Failure Protocol

### If ANY Test Fails:
1. **STOP** - Do not proceed to deployment
2. **Document** - Record the exact failure
3. **Diagnose** - Identify the root cause
4. **Fix** - Implement targeted fix
5. **Re-test** - Run ALL scenarios again
6. **Repeat** until all tests pass

## Final Verification

Before claiming success:
- [ ] Run all tests 2x to ensure consistency
- [ ] Test in different browsers (Chrome, Firefox)
- [ ] Test with different user accounts
- [ ] Verify no memory leaks
- [ ] Check performance metrics
- [ ] Review all code changes one more time

## THEN and ONLY THEN

Once ALL tests pass and ALL criteria are met:
- Document results
- Create summary report
- Push to GitHub
- Monitor Vercel deployment
- Test in production
- Provide evidence-based success report


### To-dos

- [ ] Set up clean testing environment with fresh database state
- [ ] Test Scenario 1: Fresh user sign-up happy path
- [ ] Test Scenario 2: Skip personalization button works
- [ ] Test Scenario 3: User profile doesn't exist fallback
- [ ] Test Scenario 4-6: Various API failure scenarios
- [ ] Test Scenario 7: OpenAI API key missing
- [ ] Test Scenario 8: Database connection issues
- [ ] Run complete regression test suite
- [ ] Document all test results with evidence
- [ ] Re-run all tests to verify consistency