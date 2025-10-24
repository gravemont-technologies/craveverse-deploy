// Main dashboard for CraveVerse
'use client';

// Force dynamic rendering for auth-protected page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  Trophy, 
  Coins, 
  Target, 
  Calendar,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { LevelCard } from '../../components/levels/level-card';
import { DashboardStats } from '@/components/dashboard-stats';
import { QuickActions } from '../../components/quick-actions';
import { RecentActivity } from '@/components/recent-activity';
import { useUserContext } from '@/contexts/user-context';
import { useLogger } from '@/lib/logger';
import { DebugPanel } from '@/components/debug-panel';

interface UserProfile {
  id: string;
  name: string;
  primary_craving: string;
  current_level: number;
  xp: number;
  cravecoins: number;
  streak_count: number;
  subscription_tier: string;
  ai_summary: string;
}

interface Level {
  id: string;
  level_number: number;
  title: string;
  description: string;
  challenge_text: string;
  xp_reward: number;
  coin_reward: number;
  difficulty: string;
  completed_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, isLoading, error, refreshProfile, isOnboardingComplete, syncStatus } = useUserContext();
  const logger = useLogger('Dashboard');
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [apiCalls, setApiCalls] = useState<any[]>([]);
  const [dbStatus, setDbStatus] = useState<any>(null);

  // Clear emergency bypass localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const emergencyBypass = localStorage.getItem('emergencyBypass');
      if (emergencyBypass === 'true') {
        logger.info('Clearing emergency bypass localStorage');
        localStorage.removeItem('emergencyBypass');
        localStorage.removeItem('onboardingData');
      }
    }
  }, [logger]);

  useEffect(() => {
    if (isLoaded && !user) {
      logger.info('No user authenticated, redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [isLoaded, user, router, logger]);


  // Fetch current level when user profile changes
  useEffect(() => {
    if (userProfile?.primary_craving) {
      fetchCurrentLevel();
    }
  }, [userProfile?.primary_craving]);

  const fetchCurrentLevel = async () => {
    if (!userProfile?.primary_craving) return;

    try {
      logger.info('Fetching current level', { 
        craving: userProfile.primary_craving, 
        level: userProfile.current_level 
      });

      const response = await fetch(`/api/levels/current?craving=${userProfile.primary_craving}&level=${userProfile.current_level}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'x-trace-id': logger.getTraceId(),
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentLevel(data.level);
        logger.info('Current level fetched successfully', { level: data.level });
      } else {
        logger.warn('Failed to fetch current level', { status: response.status });
      }
    } catch (error) {
      logger.error('Error fetching current level', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const handleLevelComplete = () => {
    logger.info('Level completed, refreshing data');
    refreshProfile();
    fetchCurrentLevel();
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crave-orange"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in</h1>
          <p className="text-muted-foreground">You need to be signed in to access the dashboard.</p>
          <Button onClick={() => router.push('/sign-in')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Check if user profile exists and onboarding is completed
  if (!userProfile || !isOnboardingComplete) {
    const status = !userProfile ? 'No profile found' : 'Onboarding incomplete';
    logger.info('User needs onboarding', { status, hasProfile: !!userProfile, isOnboardingComplete });
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to CraveVerse</h1>
          <p className="text-muted-foreground">
            {!userProfile 
              ? 'Please complete your setup to get started.' 
              : 'Please complete your onboarding to access the dashboard.'
            }
          </p>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}
          <div className="space-x-4">
            <Button onClick={() => router.push('/onboarding')}>
              {!userProfile ? 'Start Setup' : 'Complete Onboarding'}
            </Button>
            <Button variant="outline" onClick={refreshProfile}>
              Refresh Profile
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const cravingInfo = {
    nofap: { name: 'NoFap', icon: '🚫', color: '#FF6B6B' },
    sugar: { name: 'Sugar Free', icon: '🍭', color: '#FFD93D' },
    shopping: { name: 'Shopping Control', icon: '🛍️', color: '#6BCF7F' },
    smoking_vaping: { name: 'Smoke Free', icon: '🚭', color: '#4ECDC4' },
    social_media: { name: 'Social Media Detox', icon: '📱', color: '#A8E6CF' },
  };

  const info = cravingInfo[userProfile.primary_craving as keyof typeof cravingInfo];

  return (
    <div className="min-h-screen bg-background">
      <DebugPanel 
        logs={logger.getLogs()}
        userState={userProfile}
        apiCalls={apiCalls}
        dbStatus={dbStatus}
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {userProfile.name}!</h1>
              <p className="text-muted-foreground">
                Ready to continue your {info.name} journey?
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-crave-orange/10 text-crave-orange">
                {userProfile.subscription_tier.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-crave-orange/10 rounded-lg">
                  <Flame className="h-6 w-6 text-crave-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{userProfile.streak_count} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                  <p className="text-2xl font-bold">{userProfile.current_level}/30</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{userProfile.xp}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Coins className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CraveCoins</p>
                  <p className="text-2xl font-bold">{userProfile.cravecoins}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Level */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="text-2xl">{info.icon}</div>
                  <div>
                    <div className="text-xl">Today's Challenge</div>
                    <div className="text-sm text-muted-foreground">
                      {info.name} • Level {userProfile.current_level}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentLevel ? (
                  <LevelCard
                    level={currentLevel}
                    onComplete={handleLevelComplete}
                    userTier={userProfile.subscription_tier}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No level available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions userTier={userProfile.subscription_tier} />

            {/* Recent Activity */}
            <RecentActivity />

            {/* AI Summary */}
            {userProfile.ai_summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-crave-orange" />
                    <span>AI Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.ai_summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
                <CardDescription>
                  Level {userProfile.current_level} of 30
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Level Progress</span>
                      <span>{Math.round((userProfile.current_level / 30) * 100)}%</span>
                    </div>
                    <Progress value={(userProfile.current_level / 30) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-crave-orange">{userProfile.streak_count}</p>
                      <p className="text-xs text-muted-foreground">Day Streak</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{userProfile.xp}</p>
                      <p className="text-xs text-muted-foreground">Total XP</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
