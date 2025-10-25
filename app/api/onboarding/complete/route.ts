// API route for completing onboarding
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { updateUserProfile } from '../../../../lib/auth-utils';
import { QueueUtils } from '../../../../lib/queue';
import { createLogger, getTraceIdFromHeaders, createTraceId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const traceId = getTraceIdFromHeaders(request.headers) || createTraceId();
  const logger = createLogger('onboarding-complete-api', traceId);
  
  try {
    logger.info('Onboarding completion request started');
    
    const { userId } = await auth();
    
    if (!userId) {
      logger.warn('Unauthorized request - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { craving, quizAnswers, personalization } = await request.json();

    if (!craving) {
      logger.warn('Missing craving selection', { craving });
      return NextResponse.json(
        { error: 'Craving selection is required' },
        { status: 400 }
      );
    }

    logger.info('Processing onboarding completion', { userId, craving });

    // Make personalization optional - provide defaults if missing
    const safePersonalization = personalization || {
      introMessage: `Welcome to your ${craving} recovery journey! You've got this!`,
      customHints: [
        'Start each day with intention',
        'Track your triggers carefully',
        'Celebrate small wins'
      ]
    };

    // Get user profile with fallback creation
    let { data: userProfile, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    // If user doesn't exist, create them (fallback for webhook failure)
    if (userError && (userError.code === 'PGRST116' || userError.message?.includes('No rows found'))) {
      logger.info('User not found, creating fallback user', { userId });
      
      const { data: newUser, error: createError } = await supabaseServer
        .from('users')
        .insert({
          clerk_user_id: userId,
          email: '', // Will be updated by Clerk webhook later
          name: 'New User',
          avatar_url: null,
          subscription_tier: 'free',
          xp: 0,
          cravecoins: 0,
          streak_count: 0,
          current_level: 1,
          primary_craving: null,
        })
        .select()
        .single();

      if (createError) {
        logger.error('Error creating fallback user', { error: createError.message });
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userProfile = newUser;
      logger.info('Fallback user created successfully', { user_id: newUser.id });
    } else if (userError || !userProfile) {
      logger.error('Error fetching user profile', { error: userError?.message });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user profile with onboarding data
    logger.info('Updating user profile with onboarding data', { 
      user_id: userProfile.id, 
      craving,
      hasPersonalization: !!personalization 
    });
    
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        primary_craving: craving,
        preferences: {
          ...userProfile.preferences,
          quizAnswers,
          customHints: safePersonalization.customHints,
        },
        ai_summary: safePersonalization.introMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (updateError) {
      logger.error('Error updating user profile', { 
        error: updateError.message, 
        user_id: userProfile.id,
        craving 
      });
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    logger.info('User profile updated successfully', { 
      user_id: userProfile.id, 
      primary_craving: craving 
    });

    // ⚠️ CRITICAL: VERIFY THE UPDATE WORKED IMMEDIATELY
    logger.info('Verifying database update...', { user_id: userProfile.id });

    const { data: verifiedUser, error: verifyError } = await supabaseServer
      .from('users')
      .select('primary_craving, clerk_user_id')
      .eq('id', userProfile.id)
      .single();

    if (verifyError) {
      logger.error('Error verifying update', { error: verifyError.message });
    } else {
      logger.info('DATABASE VERIFICATION RESULT', {
        user_id: userProfile.id,
        expected_craving: craving,
        actual_craving_in_db: verifiedUser?.primary_craving,
        clerk_user_id_match: verifiedUser?.clerk_user_id === userId,
        update_successful: verifiedUser?.primary_craving === craving
      });
      
      if (verifiedUser?.primary_craving !== craving) {
        logger.error('DATABASE UPDATE VERIFICATION FAILED', {
          expected: craving,
          actual: verifiedUser?.primary_craving,
          user_id: userProfile.id
        });
      }
    }

    // Schedule AI personalization job for batch processing
    try {
      await QueueUtils.scheduleOnboardingPersonalization([userProfile.id], craving);
      logger.info('AI personalization job scheduled', { user_id: userProfile.id });
    } catch (queueError) {
      logger.warn('Error scheduling personalization job', { error: queueError instanceof Error ? queueError.message : 'Unknown error' });
      // Don't fail the request if queue fails
    }

    // Create initial pause tokens record
    try {
      await supabaseServer
        .from('pause_tokens')
        .insert({
          user_id: userProfile.id,
          tokens_available: 0,
          tokens_used: 0,
        });
      logger.info('Pause tokens record created', { user_id: userProfile.id });
    } catch (tokenError) {
      logger.warn('Error creating pause tokens record', { error: tokenError instanceof Error ? tokenError.message : 'Unknown error' });
      // Don't fail the request if this fails
    }

    // Log onboarding completion
    try {
      await supabaseServer
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'onboarding_completed',
          resource_type: 'onboarding',
          metadata: {
            craving,
            quizAnswers,
            personalization: safePersonalization,
          },
        });
      logger.info('Onboarding completion logged', { user_id: userProfile.id });
    } catch (logError) {
      logger.warn('Error logging onboarding completion', { error: logError instanceof Error ? logError.message : 'Unknown error' });
      // Don't fail the request if logging fails
    }

    logger.info('Onboarding completion successful', { 
      user_id: userProfile.id, 
      primary_craving: craving 
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: userProfile.id,
        primary_craving: craving,
        subscription_tier: userProfile.subscription_tier,
      },
    }, {
      headers: {
        'x-trace-id': traceId,
      }
    });
  } catch (error) {
    logger.error('Onboarding completion error', { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}