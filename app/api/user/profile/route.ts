// API route for getting user profile and current level
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';

export const dynamic = 'force-dynamic';

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
          // Return minimal profile instead of 500 error
          return NextResponse.json({
            user: {
              id: 'temp',
              clerk_user_id: userId,
              name: 'New User',
              primary_craving: null,
              current_level: 1,
              xp: 0,
              cravecoins: 0,
              streak_count: 0,
              subscription_tier: 'free',
              ai_summary: 'Welcome to CraveVerse!',
              preferences: {}
            },
            currentLevel: null,
          }, {
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0',
            }
          });
        }

        userProfile = newUser;
        console.log(`Fallback user created: ${newUser.id}`);
      } catch (error) {
        console.error('Error in fallback user creation:', error);
        // Return minimal profile instead of 500 error
        return NextResponse.json({
          user: {
            id: 'temp',
            clerk_user_id: userId,
            name: 'New User',
            primary_craving: null,
            current_level: 1,
            xp: 0,
            cravecoins: 0,
            streak_count: 0,
            subscription_tier: 'free',
            ai_summary: 'Welcome to CraveVerse!',
            preferences: {}
          },
          currentLevel: null,
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        });
      }
    }

    // TypeScript assertion: userProfile is guaranteed to exist at this point
    const safeUserProfile = userProfile as NonNullable<typeof userProfile>;
    
    console.log(`User profile found: ${safeUserProfile.id}, primary_craving: ${safeUserProfile.primary_craving}`);

    // Get current level
    const { data: currentLevel, error: levelError } = await supabaseServer
      .from('levels')
      .select('*')
      .eq('craving_type', safeUserProfile.primary_craving)
      .eq('level_number', safeUserProfile.current_level)
      .single();

    if (levelError) {
      console.error('Error fetching current level:', levelError);
      
      // FALLBACK: Return user without level (don't crash)
      console.log('Returning user without level due to error');
      return NextResponse.json({
        user: safeUserProfile,
        currentLevel: null,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
    }

    // Check if current level is completed
    const { data: progress, error: progressError } = await supabaseServer
      .from('user_progress')
      .select('completed_at')
      .eq('user_id', safeUserProfile.id)
      .eq('level_id', currentLevel.id)
      .single();

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error checking progress:', progressError);
    }

    // If current level is completed, get next level
    if (progress?.completed_at && safeUserProfile.current_level < 30) {
      const { data: nextLevel, error: nextLevelError } = await supabaseServer
        .from('levels')
        .select('*')
        .eq('craving_type', safeUserProfile.primary_craving)
        .eq('level_number', safeUserProfile.current_level + 1)
        .single();

      if (!nextLevelError && nextLevel) {
        return NextResponse.json({
          user: safeUserProfile,
          currentLevel: nextLevel,
        });
      }
    }

    return NextResponse.json({
      user: safeUserProfile,
      currentLevel: currentLevel || null,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    
    // Return minimal profile instead of 500 error to prevent crashes
    return NextResponse.json({
      user: {
        id: 'temp',
        clerk_user_id: 'unknown',
        name: 'User',
        primary_craving: null,
        current_level: 1,
        xp: 0,
        cravecoins: 0,
        streak_count: 0,
        subscription_tier: 'free',
        ai_summary: 'Welcome to CraveVerse!',
        preferences: {}
      },
      currentLevel: null,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}
