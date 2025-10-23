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

    console.log(`Fetching profile for user: ${userId}`);

    // Get user profile
    let userProfile = await getCurrentUserProfile();
    
    // If user doesn't exist, create them (fallback for webhook failure)
    if (!userProfile) {
      console.log(`No user profile found for: ${userId}, creating fallback user`);
      
      try {
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
      } catch (error) {
        console.error('Error in fallback user creation:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    }

    console.log(`User profile found: ${userProfile.id}, primary_craving: ${userProfile.primary_craving}`);

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
