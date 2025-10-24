// Authentication utilities for Clerk integration
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase-client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth-utils');

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  avatar_url: string;
  primary_craving: string | null;
  current_level: number;
  xp: number;
  cravecoins: number;
  streak_count: number;
  subscription_tier: 'free' | 'plus' | 'plus_trial' | 'ultra';
  plan_id: string | null;
  trial_ends_at: string | null;
  ai_summary: string | null;
  preferences: any;
  created_at: string;
  updated_at: string;
}

// Get current user profile from database
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      logger.debug('No userId from auth');
      return null;
    }

    logger.info('Looking for user profile', { clerk_user_id: userId });

    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user profile', { error: error.message, code: error.code });
      return null;
    }

    logger.info('User profile found', { 
      user_id: data.id, 
      primary_craving: data.primary_craving,
      subscription_tier: data.subscription_tier 
    });
    return data;
  } catch (error) {
    logger.error('Exception in getCurrentUserProfile', { error: error instanceof Error ? error.message : 'Unknown error' });
    return null;
  }
}

// Get user profile by ID
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    logger.debug('Fetching user profile by ID', { user_id: userId });

    const { data, error } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error fetching user profile by ID', { error: error.message, user_id: userId });
      return null;
    }

    logger.debug('User profile found by ID', { user_id: userId, primary_craving: data.primary_craving });
    return data;
  } catch (error) {
    logger.error('Exception in getUserProfile', { error: error instanceof Error ? error.message : 'Unknown error', user_id: userId });
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    logger.info('Updating user profile', { user_id: userId, updates });

    const { error } = await supabaseServer
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      logger.error('Error updating user profile', { error: error.message, user_id: userId, updates });
      return false;
    }

    logger.info('User profile updated successfully', { user_id: userId });
    return true;
  } catch (error) {
    logger.error('Exception in updateUserProfile', { error: error instanceof Error ? error.message : 'Unknown error', user_id: userId });
    return false;
  }
}

// Check if user has completed onboarding
export async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  try {
    logger.debug('Checking onboarding status', { user_id: userId });
    
    const { data, error } = await supabaseServer
      .from('users')
      .select('primary_craving')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Error checking onboarding status', { error: error.message, user_id: userId });
      return false;
    }

    const hasCompleted = !!data.primary_craving;
    logger.info('Onboarding status checked', { 
      user_id: userId, 
      hasCompleted, 
      primary_craving: data.primary_craving 
    });
    return hasCompleted;
  } catch (error) {
    logger.error('Exception in hasCompletedOnboarding', { error: error instanceof Error ? error.message : 'Unknown error', user_id: userId });
    return false;
  }
}

// Get user's subscription tier
export async function getUserSubscriptionTier(userId: string): Promise<'free' | 'plus' | 'plus_trial' | 'ultra'> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching subscription tier:', error);
      return 'free';
    }

    return data.subscription_tier;
  } catch (error) {
    console.error('Error in getUserSubscriptionTier:', error);
    return 'free';
  }
}

// Check if user can access feature
export async function canAccessFeature(
  userId: string,
  feature: string
): Promise<boolean> {
  try {
    const tier = await getUserSubscriptionTier(userId);
    
    // Check feature access based on tier
    switch (feature) {
      case 'battles':
        return tier === 'plus' || tier === 'plus_trial' || tier === 'ultra';
      case 'all_levels':
        return tier === 'plus' || tier === 'plus_trial' || tier === 'ultra';
      case 'multiple_cravings':
        return tier === 'ultra';
      case 'ai_coaching':
        return tier === 'ultra';
      default:
        return true;
    }
  } catch (error) {
    console.error('Error in canAccessFeature:', error);
    return false;
  }
}

// Get user's remaining AI calls for today
export async function getRemainingAICalls(userId: string): Promise<number> {
  try {
    const tier = await getUserSubscriptionTier(userId);
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Get current usage from cache or database
    const { data, error } = await supabase
      .from('ai_usage_metrics')
      .select('tokens_used')
      .eq('user_id', userId)
      .gte('created_at', today);

    if (error) {
      console.error('Error fetching AI usage:', error);
      return 0;
    }

    const totalTokens = data.reduce((sum, record) => sum + record.tokens_used, 0);
    
    // Calculate remaining calls based on tier
    const limits = {
      free: 10,
      plus: 50,
      plus_trial: 50,
      ultra: 999,
    };

    const limit = limits[tier];
    const estimatedCallsUsed = Math.floor(totalTokens / 100); // Rough estimation
    
    return Math.max(0, limit - estimatedCallsUsed);
  } catch (error) {
    console.error('Error in getRemainingAICalls:', error);
    return 0;
  }
}

// Check if user is in trial period
export async function isInTrialPeriod(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier, trial_ends_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking trial status:', error);
      return false;
    }

    if (data.subscription_tier !== 'plus_trial') {
      return false;
    }

    if (!data.trial_ends_at) {
      return false;
    }

    const trialEndsAt = new Date(data.trial_ends_at);
    const now = new Date();

    return now < trialEndsAt;
  } catch (error) {
    console.error('Error in isInTrialPeriod:', error);
    return false;
  }
}

// Get user's progress statistics
export async function getUserProgressStats(userId: string): Promise<{
  totalLevelsCompleted: number;
  currentStreak: number;
  totalXP: number;
  totalCoins: number;
  currentLevel: number;
}> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('current_level, xp, cravecoins, streak_count')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching progress stats:', error);
      return {
        totalLevelsCompleted: 0,
        currentStreak: 0,
        totalXP: 0,
        totalCoins: 0,
        currentLevel: 1,
      };
    }

    // Get completed levels count
    const { count: completedLevels } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null);

    return {
      totalLevelsCompleted: completedLevels || 0,
      currentStreak: data.streak_count,
      totalXP: data.xp,
      totalCoins: data.cravecoins,
      currentLevel: data.current_level,
    };
  } catch (error) {
    console.error('Error in getUserProgressStats:', error);
    return {
      totalLevelsCompleted: 0,
      currentStreak: 0,
      totalXP: 0,
      totalCoins: 0,
      currentLevel: 1,
    };
  }
}

// Create user context for API routes
export async function createUserContext(): Promise<{
  user: UserProfile | null;
  isAuthenticated: boolean;
  canAccess: (feature: string) => Promise<boolean>;
  remainingAICalls: number;
  progressStats: any;
}> {
  const user = await getCurrentUserProfile();
  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    canAccess: (feature: string) => 
      user ? canAccessFeature(user.id, feature) : Promise.resolve(false),
    remainingAICalls: user ? await getRemainingAICalls(user.id) : 0,
    progressStats: user ? await getUserProgressStats(user.id) : null,
  };
}
