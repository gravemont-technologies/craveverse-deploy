// API route for getting user profile and current level
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { getCurrentUserProfile } from '../../../../lib/auth-utils';
import { createLogger, getTraceIdFromHeaders, createTraceId } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const traceId = getTraceIdFromHeaders(request.headers) || createTraceId();
  const logger = createLogger('user-profile-api', traceId);
  
  try {
    logger.info('Profile API request started');
    
    const { userId } = await auth();
    
    if (!userId) {
      logger.warn('Unauthorized request - no userId');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Fetching profile for user', { userId });

    // Get user profile
    let userProfile = await getCurrentUserProfile();
    
    // If user doesn't exist, create them (fallback for webhook failure)
    if (!userProfile) {
      logger.info('No user profile found, creating fallback user', { userId });
      
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
          logger.error('Error creating fallback user', { error: createError.message });
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
              'x-trace-id': traceId,
            }
          });
        }

        userProfile = newUser;
        logger.info('Fallback user created successfully', { user_id: newUser.id });
      } catch (error) {
        logger.error('Exception in fallback user creation', { error: error instanceof Error ? error.message : 'Unknown error' });
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
            'x-trace-id': traceId,
          }
        });
      }
    }

    // TypeScript assertion: userProfile is guaranteed to exist at this point
    const safeUserProfile = userProfile as NonNullable<typeof userProfile>;
    
    logger.info('User profile found', { 
      user_id: safeUserProfile.id, 
      primary_craving: safeUserProfile.primary_craving,
      current_level: safeUserProfile.current_level 
    });

    // Get current level
    const { data: currentLevel, error: levelError } = await supabaseServer
      .from('levels')
      .select('*')
      .eq('craving_type', safeUserProfile.primary_craving)
      .eq('level_number', safeUserProfile.current_level)
      .single();

    if (levelError) {
      logger.warn('Error fetching current level', { error: levelError.message });
      
      // FALLBACK: Return user without level (don't crash)
      logger.info('Returning user without level due to error');
      return NextResponse.json({
        user: safeUserProfile,
        currentLevel: null,
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'x-trace-id': traceId,
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
      logger.warn('Error checking progress', { error: progressError.message });
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
        logger.info('Returning next level', { level: nextLevel.level_number });
        return NextResponse.json({
          user: safeUserProfile,
          currentLevel: nextLevel,
        }, {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'x-trace-id': traceId,
          }
        });
      }
    }

    logger.info('Profile API request completed successfully');
    return NextResponse.json({
      user: safeUserProfile,
      currentLevel: currentLevel || null,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'x-trace-id': traceId,
      }
    });
  } catch (error) {
    logger.error('Profile fetch error', { error: error instanceof Error ? error.message : 'Unknown error' });
    
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
        'x-trace-id': traceId,
      }
    });
  }
}
