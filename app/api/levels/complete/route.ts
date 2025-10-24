// API route for completing levels
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { createOpenAIClient } from '../../../../lib/openai-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';
import { CONFIG } from '../../../../lib/config';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { levelId, userResponse } = await request.json();

    if (!levelId || !userResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get level details
    const { data: level, error: levelError } = await supabaseServer
      .from('levels')
      .select('*')
      .eq('id', levelId)
      .single();

    if (levelError || !level) {
      return NextResponse.json({ error: 'Level not found' }, { status: 404 });
    }

    // Check if user can access this level
    if (userProfile.subscription_tier === 'free' && level.level_number > 10) {
      return NextResponse.json(
        { error: 'Level locked. Upgrade to access all levels.' },
        { status: 403 }
      );
    }

    // Check if level is already completed
    const { data: existingProgress, error: progressError } = await supabaseServer
      .from('user_progress')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('level_id', levelId)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: 'Failed to check progress' },
        { status: 500 }
      );
    }

    if (existingProgress?.completed_at) {
      return NextResponse.json(
        { error: 'Level already completed' },
        { status: 400 }
      );
    }

    // Generate AI feedback
    let aiFeedback = '';
    try {
      const openai = createOpenAIClient(userId, userProfile.subscription_tier as 'free' | 'plus' | 'ultra');
      
      if (!openai) {
        console.warn('OpenAI client not available for level feedback');
        throw new Error('OpenAI client not available');
      }
      
      aiFeedback = await openai.generateLevelFeedback(
        level.level_number,
        level.craving_type,
        userResponse,
        'encouraging'
      );
    } catch (error) {
      console.error('AI feedback generation failed:', error);
      // Use fallback template
      aiFeedback = CONFIG.FALLBACK_TEMPLATES.LEVEL_FEEDBACK[
        Math.floor(Math.random() * CONFIG.FALLBACK_TEMPLATES.LEVEL_FEEDBACK.length)
      ];
    }

    // Update user progress
    const { error: progressUpdateError } = await supabaseServer
      .from('user_progress')
      .upsert({
        user_id: userProfile.id,
        level_id: levelId,
        completed_at: new Date().toISOString(),
        ai_feedback: aiFeedback,
        user_response: userResponse,
        metadata: {
          completion_time: new Date().toISOString(),
          user_tier: userProfile.subscription_tier,
        },
      });

    if (progressUpdateError) {
      console.error('Error updating progress:', progressUpdateError);
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      );
    }

    // Award XP and coins
    const { error: rewardError } = await supabaseServer
      .from('users')
      .update({
        xp: userProfile.xp + level.xp_reward,
        cravecoins: userProfile.cravecoins + level.coin_reward,
        current_level: Math.max(userProfile.current_level, level.level_number + 1),
        streak_count: userProfile.streak_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (rewardError) {
      console.error('Error awarding rewards:', rewardError);
      return NextResponse.json(
        { error: 'Failed to award rewards' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabaseServer
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'level_completed',
          resource_type: 'level',
          resource_id: levelId,
          metadata: {
            level_number: level.level_number,
            xp_reward: level.xp_reward,
            coin_reward: level.coin_reward,
            user_response: userResponse,
            ai_feedback: aiFeedback,
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      aiFeedback,
      rewards: {
        xp: level.xp_reward,
        coins: level.coin_reward,
      },
      newLevel: level.level_number + 1,
    });
  } catch (error) {
    console.error('Level completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
