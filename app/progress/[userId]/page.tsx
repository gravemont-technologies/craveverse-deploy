// Shareable progress page
'use client';

// Force dynamic rendering for auth-protected page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Flame, 
  Target, 
  Star,
  Crown,
  Zap,
  TrendingUp,
  Share2,
  Download
} from 'lucide-react';

interface ProgressData {
  username: string;
  avatar: string;
  tier: string;
  xp: number;
  streak: number;
  levels_completed: number;
  battles_won: number;
  craving_type: string;
  join_date: string;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked_at: string;
  }>;
  recent_activity: Array<{
    action: string;
    timestamp: string;
    details: string;
  }>;
}

export default function ProgressPage() {
  const params = useParams();
  const userId = params?.userId as string;
  
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [userId]);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/progress/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProgressData(data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${progressData?.username}'s CraveVerse Progress`,
          text: `Check out ${progressData?.username}'s amazing progress on CraveVerse!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = () => {
    // Generate and download progress image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Draw background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw content (simplified)
    ctx.fillStyle = '#fa9653';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('CraveVerse Progress', 50, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`${progressData?.username}'s Journey`, 50, 150);

    // Convert to image and download
    const link = document.createElement('a');
    link.download = `${progressData?.username}-progress.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultra':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'plus':
        return <Zap className="h-6 w-6 text-blue-500" />;
      default:
        return <Star className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ultra':
        return 'bg-yellow-100 text-yellow-800';
      case 'plus':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCravingIcon = (craving: string) => {
    const icons = {
      nofap: '🚫',
      sugar: '🍭',
      shopping: '🛍️',
      smoking_vaping: '🚭',
      social_media: '📱',
    };
    return icons[craving as keyof typeof icons] || '🌐';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crave-orange"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Progress Not Found</h1>
          <p className="text-muted-foreground">This user's progress is not available or private.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{progressData.username}'s Progress</h1>
              <p className="text-muted-foreground">
                Journey to conquer {progressData.craving_type.replace('_', ' ')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleShare} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload} className="bg-crave-orange hover:bg-crave-orange-dark">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-crave-orange/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-crave-orange" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                  <p className="text-2xl font-bold">{progressData.xp.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Flame className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold">{progressData.streak} days</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Levels Completed</p>
                  <p className="text-2xl font-bold">{progressData.levels_completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Battles Won</p>
                  <p className="text-2xl font-bold">{progressData.battles_won}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-crave-orange/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {progressData.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold">{progressData.username}</h2>
                  <Badge className={getTierColor(progressData.tier)}>
                    {getTierIcon(progressData.tier)}
                    <span className="ml-1">{progressData.tier.toUpperCase()}</span>
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <span>{getCravingIcon(progressData.craving_type)}</span>
                    <span>{progressData.craving_type.replace('_', ' ')}</span>
                  </span>
                  <span>Joined {new Date(progressData.join_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        {progressData.achievements.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-crave-orange" />
                <span>Achievements</span>
              </CardTitle>
              <CardDescription>
                Unlocked achievements and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{achievement.name}</div>
                      <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-crave-orange" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest achievements and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-crave-orange rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.details}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


