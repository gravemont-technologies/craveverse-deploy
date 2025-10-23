// API route for starting free trial
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId || planId === 'free') {
      return NextResponse.json(
        { error: 'Invalid plan for trial' },
        { status: 400 }
      );
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has an active subscription or trial
    const { data: existingSubscription, error: subError } = await supabaseServer
      .from('subscriptions')
      .select('status, plan_id, trial_end')
      .eq('user_id', userProfile.id)
      .in('status', ['active', 'trialing'])
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', subError);
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription or trial' },
        { status: 400 }
      );
    }

    // Check if user has used trial before
    const { data: trialHistory, error: trialError } = await supabaseServer
      .from('trial_history')
      .select('id')
      .eq('user_id', userProfile.id)
      .eq('plan_id', planId)
      .single();

    if (trialError && trialError.code !== 'PGRST116') {
      console.error('Error checking trial history:', trialError);
      return NextResponse.json(
        { error: 'Failed to check trial history' },
        { status: 500 }
      );
    }

    if (trialHistory) {
      return NextResponse.json(
        { error: 'Trial already used for this plan' },
        { status: 400 }
      );
    }

    // Start trial
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    // Create trial subscription
    const { data: subscription, error: createError } = await supabaseServer
      .from('subscriptions')
      .insert({
        user_id: userProfile.id,
        plan_id: planId,
        status: 'trialing',
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        current_period_start: trialStart.toISOString(),
        current_period_end: trialEnd.toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating trial subscription:', createError);
      return NextResponse.json(
        { error: 'Failed to start trial' },
        { status: 500 }
      );
    }

    // Update user's plan
    const { error: updateUserError } = await supabaseServer
      .from('users')
      .update({
        plan_id: planId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (updateUserError) {
      console.error('Error updating user plan:', updateUserError);
      return NextResponse.json(
        { error: 'Failed to update user plan' },
        { status: 500 }
      );
    }

    // Record trial history
    const { error: trialHistoryError } = await supabaseServer
      .from('trial_history')
      .insert({
        user_id: userProfile.id,
        plan_id: planId,
        started_at: trialStart.toISOString(),
        ended_at: trialEnd.toISOString(),
      });

    if (trialHistoryError) {
      console.error('Error recording trial history:', trialHistoryError);
      // Don't fail the request for this
    }

    // Log activity
    try {
      await supabaseServer
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'trial_started',
          resource_type: 'subscription',
          resource_id: subscription.id,
          metadata: {
            plan_id: planId,
            trial_end: trialEnd.toISOString(),
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Trial started successfully',
      trial_end: trialEnd.toISOString(),
      plan_id: planId,
    });
  } catch (error) {
    console.error('Start trial error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


