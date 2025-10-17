// API route for completing onboarding
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { updateUserProfile } from '../../../../lib/auth-utils';
import { QueueUtils } from '../../../../lib/queue';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { craving, quizAnswers, personalization } = await request.json();

    if (!craving || !personalization) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user profile with onboarding data
    const { error: updateError } = await supabase
      .from('users')
      .update({
        primary_craving: craving,
        preferences: {
          ...userProfile.preferences,
          quizAnswers,
          customHints: personalization.customHints,
        },
        ai_summary: personalization.introMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Schedule AI personalization job for batch processing
    try {
      await QueueUtils.scheduleOnboardingPersonalization([userProfile.id], craving);
    } catch (queueError) {
      console.error('Error scheduling personalization job:', queueError);
      // Don't fail the request if queue fails
    }

    // Create initial pause tokens record
    try {
      await supabase
        .from('pause_tokens')
        .insert({
          user_id: userProfile.id,
          tokens_available: 0,
          tokens_used: 0,
        });
    } catch (tokenError) {
      console.error('Error creating pause tokens record:', tokenError);
      // Don't fail the request if this fails
    }

    // Log onboarding completion
    try {
      await supabase
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'onboarding_completed',
          resource_type: 'onboarding',
          metadata: {
            craving,
            quizAnswers,
            personalization,
          },
        });
    } catch (logError) {
      console.error('Error logging onboarding completion:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      user: {
        id: userProfile.id,
        primary_craving: craving,
        subscription_tier: userProfile.subscription_tier,
      },
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
