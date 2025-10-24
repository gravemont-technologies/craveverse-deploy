// API route for completing onboarding
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { updateUserProfile } from '../../../../lib/auth-utils';
import { QueueUtils } from '../../../../lib/queue';


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

    console.log(`Processing onboarding completion for user: ${userId}, craving: ${craving}`);

    // Get user profile with fallback creation
    let { data: userProfile, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    // If user doesn't exist, create them (fallback for webhook failure)
    if (userError && (userError.code === 'PGRST116' || userError.message?.includes('No rows found'))) {
      console.log(`User not found, creating fallback user for: ${userId}`);
      
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
        console.error('Error creating fallback user:', createError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userProfile = newUser;
      console.log(`Fallback user created: ${newUser.id}`);
    } else if (userError || !userProfile) {
      console.error('Error fetching user profile:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user profile with onboarding data
    console.log(`Updating user profile ${userProfile.id} with primary_craving: ${craving}`);
    
    const { error: updateError } = await supabaseServer
      .from('users')
      .update({
        primary_craving: craving,
        preferences: {
          ...userProfile.preferences,
          quizAnswers,
          customHints: personalization?.customHints || [],
        },
        ai_summary: personalization?.introMessage || `Welcome to your ${craving} recovery journey!`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      console.error('Update error details:', JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log(`Successfully updated user profile ${userProfile.id} with primary_craving: ${craving}`);

    // Schedule AI personalization job for batch processing
    try {
      await QueueUtils.scheduleOnboardingPersonalization([userProfile.id], craving);
    } catch (queueError) {
      console.error('Error scheduling personalization job:', queueError);
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
    } catch (tokenError) {
      console.error('Error creating pause tokens record:', tokenError);
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
