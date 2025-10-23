// API route for battle statistics
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';


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

    // Get all battles for the user
    const { data: battles, error: battlesError } = await supabaseServer
      .from('battles')
      .select('status, winner_id, user1_id, user2_id, created_at')
      .or(`user1_id.eq.${userProfile.id},user2_id.eq.${userProfile.id}`)
      .eq('status', 'completed');

    if (battlesError) {
      console.error('Error fetching battles:', battlesError);
      return NextResponse.json(
        { error: 'Failed to fetch battle statistics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalBattles = battles?.length || 0;
    let wins = 0;
    let losses = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Sort battles by creation date (oldest first) to calculate streaks correctly
    const sortedBattles = battles?.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];

    for (const battle of sortedBattles) {
      const isUser1 = battle.user1_id === userProfile.id;
      const isWinner = (isUser1 && battle.winner_id === 'user1') || 
                      (!isUser1 && battle.winner_id === 'user2');

      if (isWinner) {
        wins++;
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        losses++;
        tempStreak = 0;
      }
    }

    // Current streak is the streak from the most recent battles
    currentStreak = tempStreak;

    const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

    const stats = {
      totalBattles,
      wins,
      losses,
      winRate,
      currentStreak,
      bestStreak,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Battle stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
