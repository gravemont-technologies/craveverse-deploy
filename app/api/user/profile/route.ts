// API route for getting user profile and current level
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

    // Get user profile
    const userProfile = await getCurrentUserProfile();
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get current level
    const { data: currentLevel, error: levelError } = await supabaseServer
      .from('levels')
      .select('*')
      .eq('craving_type', userProfile.primary_craving)
      .eq('level_number', userProfile.current_level)
      .single();

    if (levelError) {
      console.error('Error fetching current level:', levelError);
      return NextResponse.json(
        { error: 'Failed to fetch current level' },
        { status: 500 }
      );
    }

    // Check if current level is completed
    const { data: progress, error: progressError } = await supabaseServer
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', userProfile.id)
      .eq('level_id', currentLevel.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error checking progress:', progressError);
    }

    // If current level is completed, get next level
    if (progress?.completed_at && userProfile.current_level < 30) {
      const { data: nextLevel, error: nextLevelError } = await supabaseServer
        .from('levels')
        .select('*')
        .eq('craving_type', userProfile.primary_craving)
        .eq('level_number', userProfile.current_level + 1)
        .single();

      if (!nextLevelError && nextLevel) {
        return NextResponse.json({
          user: userProfile,
          currentLevel: nextLevel,
        });
      }
    }

    return NextResponse.json({
      user: userProfile,
      currentLevel: currentLevel || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
