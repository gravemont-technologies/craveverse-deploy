// API route for completing battle tasks
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../../lib/auth-utils';


export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { battleId, taskId } = await request.json();

    if (!battleId || !taskId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is part of this battle
    const { data: battle, error: battleError } = await supabaseServer
      .from('battles')
      .select('user1_id, user2_id, status, end_time')
      .eq('id', battleId)
      .single();

    if (battleError || !battle) {
      return NextResponse.json({ error: 'Battle not found' }, { status: 404 });
    }

    if (battle.user1_id !== userProfile.id && battle.user2_id !== userProfile.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (battle.status !== 'active') {
      return NextResponse.json({ error: 'Battle is not active' }, { status: 400 });
    }

    // Check if battle time has expired
    if (battle.end_time && new Date(battle.end_time) < new Date()) {
      return NextResponse.json({ error: 'Battle time has expired' }, { status: 400 });
    }

    // Check if task exists and is not already completed
    const { data: task, error: taskError } = await supabaseServer
      .from('battle_tasks')
      .select('id, completed, xp_reward, coin_reward')
      .eq('id', taskId)
      .eq('battle_id', battleId)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (task.completed) {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 });
    }

    // Mark task as completed
    const { error: updateTaskError } = await supabaseServer
      .from('battle_tasks')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (updateTaskError) {
      console.error('Error updating task:', updateTaskError);
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      );
    }

    // Update user's task completion count
    const isUser1 = battle.user1_id === userProfile.id;
    const updateField = isUser1 ? 'user1_tasks_completed' : 'user2_tasks_completed';

    // Get current value and increment
    const { data: battleData } = await supabaseServer
      .from('battles')
      .select(updateField)
      .eq('id', battleId)
      .single();

    const { error: updateBattleError } = await supabaseServer
      .from('battles')
      .update({
        [updateField]: ((battleData as any)?.[updateField] || 0) + 1,
      })
      .eq('id', battleId);

    if (updateBattleError) {
      console.error('Error updating battle progress:', updateBattleError);
      return NextResponse.json(
        { error: 'Failed to update battle progress' },
        { status: 500 }
      );
    }

    // Award XP and CraveCoins to user
    const { error: updateUserError } = await supabaseServer
      .from('users')
      .update({
        xp: userProfile.xp + task.xp_reward,
        cravecoins: userProfile.cravecoins + task.coin_reward,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userProfile.id);

    if (updateUserError) {
      console.error('Error updating user rewards:', updateUserError);
      return NextResponse.json(
        { error: 'Failed to award rewards' },
        { status: 500 }
      );
    }

    // Check if battle should be completed
    const { data: updatedBattle, error: updatedBattleError } = await supabaseServer
      .from('battles')
      .select('user1_tasks_completed, user2_tasks_completed, user1_id, user2_id')
      .eq('id', battleId)
      .single();

    if (updatedBattleError) {
      console.error('Error fetching updated battle:', updatedBattleError);
    } else if (updatedBattle) {
      // If both players have completed all tasks, determine winner
      if (updatedBattle.user1_tasks_completed >= 3 && updatedBattle.user2_tasks_completed >= 3) {
        const { error: completeBattleError } = await supabaseServer
          .from('battles')
          .update({
            status: 'completed',
            winner_id: updatedBattle.user1_tasks_completed > updatedBattle.user2_tasks_completed ? 'user1' : 'user2',
          })
          .eq('id', battleId);

        if (completeBattleError) {
          console.error('Error completing battle:', completeBattleError);
        }
      }
    }

    // Log activity
    try {
      await supabaseServer
        .from('activity_log')
        .insert({
          user_id: userProfile.id,
          action: 'battle_task_completed',
          resource_type: 'battle_task',
          resource_id: taskId,
          metadata: {
            battle_id: battleId,
            xp_reward: task.xp_reward,
            coin_reward: task.coin_reward,
          },
        });
    } catch (logError) {
      console.error('Error logging activity:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Task completed successfully',
      xp_reward: task.xp_reward,
      coin_reward: task.coin_reward,
    });
  } catch (error) {
    console.error('Complete battle task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

