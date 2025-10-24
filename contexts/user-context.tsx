// User context provider for state management with optimistic updates
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLogger } from '@/lib/logger';

interface UserProfile {
  id: string;
  clerk_user_id: string;
  name: string;
  primary_craving: string | null;
  current_level: number;
  xp: number;
  cravecoins: number;
  streak_count: number;
  subscription_tier: string;
  ai_summary: string;
  preferences: any;
}

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  isOnboardingComplete: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, isLoaded } = useUser();
  const logger = useLogger('UserProvider');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');

  const fetchProfile = useCallback(async (traceId?: string) => {
    if (!user) {
      logger.info('No user authenticated, clearing profile');
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      logger.info('Fetching user profile', { userId: user.id, traceId });
      setSyncStatus('syncing');
      setError(null);

      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          ...(traceId && { 'x-trace-id': traceId }),
        },
      });

      if (!response.ok) {
        throw new Error(`Profile fetch failed: ${response.status}`);
      }

      const data = await response.json();
      logger.info('Profile fetched successfully', { profile: data.user });
      
      setUserProfile(data.user);
      setSyncStatus('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Failed to fetch profile', { error: errorMessage });
      setError(errorMessage);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [user, logger]);

  const refreshProfile = useCallback(async () => {
    const traceId = Math.random().toString(36).substring(2, 15);
    await fetchProfile(traceId);
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    logger.info('Optimistically updating profile', { updates });
    
    // Optimistic update
    setUserProfile(prev => prev ? { ...prev, ...updates } : null);
    
    try {
      // In a real implementation, you'd make an API call here
      // For now, we'll just refresh the profile
      await refreshProfile();
    } catch (err) {
      logger.error('Failed to update profile, reverting optimistic update', { error: err });
      // Revert optimistic update
      await refreshProfile();
    }
  }, [userProfile, logger, refreshProfile]);

  // Fetch profile when user changes
  useEffect(() => {
    if (isLoaded) {
      fetchProfile();
    }
  }, [isLoaded, fetchProfile]);

  // Refresh profile when window becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        logger.info('Window became visible, refreshing profile');
        refreshProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshProfile, logger]);

  const isOnboardingComplete = userProfile?.primary_craving !== null && userProfile?.primary_craving !== undefined;

  const value: UserContextType = {
    userProfile,
    isLoading,
    error,
    refreshProfile,
    updateProfile,
    isOnboardingComplete,
    syncStatus,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
