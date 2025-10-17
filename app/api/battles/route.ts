// API route for battles
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserProfile } from '../../../lib/auth-utils';
import { QueueUtils } from '../../../lib/queue';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get active battles (waiting or active)
    const { data: activeBattles, error: activeError } = await supabase
      .from('battles')
      .select(`
        id,
        user1_name,
        user2_name,
        craving_type,
        status,
        start_time,
        end_time,
        winner_id,
        user1_tasks_completed,
        user2_tasks_completed,
        created_at
      `)
      .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('Error fetching active battles:', activeError);
      return NextResponse.json(
        { error: 'Failed to fetch active battles' },
        { status: 500 }
      );
    }

    // Get completed battles
    const { data: completedBattles, error: completedError } = await supabase
      .from('battles')
      .select(`
        id,
        user1_name,
        user2_name,
        craving_type,
        status,
        start_time,
        end_time,
        winner_id,
        user1_tasks_completed,
        user2_tasks_completed,
        created_at
      `)
      .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .limit(20);

    if (completedError) {
      console.error('Error fetching completed battles:', completedError);
      return NextResponse.json(
        { error: 'Failed to fetch completed battles' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activeBattles: activeBattles || [],
      completedBattles: completedBattles || [],
    });
  } catch (error) {
    console.error('Battles fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { craving_type, duration_hours } = await request.json();

    if (!craving_type || !duration_hours) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user can create battles (rate limiting)
    const { data: recentBattles, error: recentError } = await supabase
      .from('battles')
      .select('id')
      .eq('user1_id', userProfile.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (recentError) {
      console.error('Error checking recent battles:', recentError);
    }

    const dailyLimit = userProfile.subscription_tier === 'free' ? 1 : 5;
    if (recentBattles && recentBattles.length >= dailyLimit) {
      return NextResponse.json(
        { error: `Daily battle limit reached. You can create ${dailyLimit} battle(s) per day.` },
        { status: 429 }
      );
    }

    // Create battle
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration_hours * 60 * 60 * 1000);

    const { data: battle, error: battleError } = await supabase
      .from('battles')
      .insert({
        user1_id: userProfile.id,
        user1_name: userProfile.name,
        craving_type,
        status: 'waiting',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        user1_tasks_completed: 0,
        user2_tasks_completed: 0,
      })
      .select(`
        id,
        user1_name,
        user2_name,
        craving_type,
        status,
        start_time,
        end_time,
        user1_tasks_completed,
        user2_tasks_completed,
        created_at
      `)
      .single();

    if (battleError) {
      console.error('Error creating battle:', battleError);
      return NextResponse.json(
        { error: 'Failed to create battle' },
        { status: 500 }
      );
    }

    // Add job to queue for AI task generation
    await QueueUtils.scheduleBattleTasks(craving_type);

    // Log activity
    try {
      await supabase
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'battle_created',
          resource_type: 'battle',
          resource_id: battle.id,
          metadata: {
            craving_type,
            duration_hours,
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      battle: {
        id: battle.id,
        user1_name: battle.user1_name,
        user2_name: battle.user2_name,
        craving_type: battle.craving_type,
        status: battle.status,
        start_time: battle.start_time,
        end_time: battle.end_time,
        user1_tasks_completed: battle.user1_tasks_completed,
        user2_tasks_completed: battle.user2_tasks_completed,
        created_at: battle.created_at,
      },
    });
  } catch (error) {
    console.error('Create battle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
