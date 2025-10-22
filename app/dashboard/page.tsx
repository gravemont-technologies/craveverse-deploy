// Main dashboard for CraveVerse
'use client';

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    } else if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        setCurrentLevel(data.currentLevel);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLevelComplete = () => {
    // Refresh data after level completion
    fetchUserData();
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

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to CraveVerse</h1>
          <p className="text-muted-foreground">Please complete your onboarding first.</p>
          <Button onClick={() => router.push('/onboarding')}>
            Start Onboarding
          </Button>
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
