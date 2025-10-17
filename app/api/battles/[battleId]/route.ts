// API route for individual battle details
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ battleId: string }> }
) {
  try {
    const { battleId } = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get battle details
    const { data: battle, error: battleError } = await supabase
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
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    // Check if user is part of this battle
    const { data: userBattle, error: userBattleError } = await supabase
      .from('battles')
      .select('user1_id, user2_id')
      .eq('id', battleId)
      .single();

    if (userBattleError || !userBattle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    if (userBattle.user1_id !== userProfile.id && userBattle.user2_id !== userProfile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get battle tasks
    const { data: tasks, error: tasksError } = await supabase
      .from('battle_tasks')
      .select(`
        id,
        title,
        description,
        difficulty,
        xp_reward,
        coin_reward,
        completed,
        completed_at
      `)
      .eq('battle_id', battleId)
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('Error fetching battle tasks:', tasksError);
      return NextResponse.json(
        { error: 'Failed to fetch battle tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      battle,
      tasks: tasks || [],
    });
  } catch (error) {
    console.error('Battle details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

