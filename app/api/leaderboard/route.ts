// API route for leaderboard data
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../lib/auth-utils';


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

    // Get overall leaderboard (top 100 users by XP)
    const { data: overallData, error: overallError } = await supabaseServer
      .from('users')
      .select(`
        id,
        username,
        xp,
        streak_days,
        plan_id,
        current_craving_id,
        cravings!inner(name)
      `)
      .not('username', 'is', null)
      .order('xp', { ascending: false })
      .limit(100);

    if (overallError) {
      console.error('Error fetching overall leaderboard:', overallError);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard data' },
        { status: 500 }
      );
    }

    // Get battle wins for each user
    const { data: battleData, error: battleError } = await supabaseServer
      .from('battles')
      .select('winner_id, user1_id, user2_id')
      .eq('status', 'completed')
      .not('winner_id', 'is', null);

    if (battleError) {
      console.error('Error fetching battle data:', battleError);
    }

    // Get level completion counts
    const { data: levelData, error: levelError } = await supabaseServer
      .from('user_levels')
      .select('user_id, status')
      .eq('status', 'completed');

    if (levelError) {
      console.error('Error fetching level data:', levelError);
    }

    // Process data
    const battleWins = battleData?.reduce((acc: Record<string, number>, battle: any) => {
      if (battle.winner_id === 'user1') {
        acc[battle.user1_id] = (acc[battle.user1_id] || 0) + 1;
      } else if (battle.winner_id === 'user2') {
        acc[battle.user2_id] = (acc[battle.user2_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const levelCounts = levelData?.reduce((acc: Record<string, number>, level: any) => {
      acc[level.user_id] = (acc[level.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Transform data for leaderboard
    const overall = overallData?.map((user: any, index: number) => ({
      rank: index + 1,
      username: user.username,
      avatar: '', // Would need to add avatar field
      tier: user.plan_id || 'free',
      xp: user.xp || 0,
      streak: user.streak_days || 0,
      battles_won: battleWins[user.id] || 0,
      levels_completed: levelCounts[user.id] || 0,
      craving_type: (user.cravings as any)?.name || 'unknown',
    })) || [];

    // Get streaks leaderboard
    const streaks = overall
      .sort((a: any, b: any) => b.streak - a.streak)
      .map((user: any, index: number) => ({ ...user, rank: index + 1 }));

    // Get battles leaderboard
    const battles = overall
      .sort((a: any, b: any) => b.battles_won - a.battles_won)
      .map((user: any, index: number) => ({ ...user, rank: index + 1 }));

    // Group by craving type
    const byCraving = overall.reduce((acc: Record<string, any[]>, user: any) => {
      const craving = user.craving_type;
      if (!acc[craving]) {
        acc[craving] = [];
      }
      acc[craving].push(user);
      return acc;
    }, {} as Record<string, typeof overall>);

    // Sort each craving group by XP
    Object.keys(byCraving).forEach(craving => {
      byCraving[craving] = byCraving[craving]
        .sort((a: any, b: any) => b.xp - a.xp)
        .map((user: any, index: number) => ({ ...user, rank: index + 1 }));
    });

    const leaderboard = {
      overall,
      byCraving,
      streaks,
      battles,
    };

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


