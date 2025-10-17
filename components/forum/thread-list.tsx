'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  ThumbsUp, 
  Clock, 
  Users,
  Flame,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_avatar: string;
  author_tier: string;
  craving_type: string;
  upvotes: number;
  reply_count: number;
  created_at: string;
  ai_reply_suggested?: string;
}

interface ThreadListProps {
  threads: ForumThread[];
  onThreadUpdate: () => void;
}

export function ThreadList({ threads, onThreadUpdate }: ThreadListProps) {
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'free':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleUpvote = async (threadId: string) => {
    try {
      const response = await fetch('/api/forum/upvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId }),
      });

      if (response.ok) {
        onThreadUpdate();
      }
    } catch (error) {
      console.error('Error upvoting thread:', error);
    }
  };

  const getThreadStatus = (thread: ForumThread) => {
    const hoursAgo = Math.floor((new Date().getTime() - new Date(thread.created_at).getTime()) / (1000 * 60 * 60));
    
    if (thread.upvotes >= 10) return { label: 'Hot', icon: Flame, color: 'text-red-600' };
    if (thread.upvotes >= 5) return { label: 'Trending', icon: TrendingUp, color: 'text-orange-600' };
    if (hoursAgo < 2) return { label: 'New', icon: Star, color: 'text-green-600' };
    return null;
  };

  return (
    <div className="space-y-4">
      {threads.map((thread) => {
        const status = getThreadStatus(thread);
        
        return (
          <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getCravingIcon(thread.craving_type)}</span>
                    <Badge variant="outline" className="text-xs">
                      {thread.craving_type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {status && (
                      <Badge className={`text-xs ${status.color}`}>
                        <status.icon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight mb-2">
                    {thread.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {thread.content}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                {/* Author Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={thread.author_avatar} />
                    <AvatarFallback>
                      {thread.author_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{thread.author_name}</span>
                    <Badge className={getTierColor(thread.author_tier)} variant="outline">
                      {thread.author_tier.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Thread Stats */}
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{thread.reply_count}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{thread.upvotes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(thread.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* AI Reply Suggestion */}
              {thread.ai_reply_suggested && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Zap className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">AI Reply Suggestion</p>
                      <p className="text-xs text-blue-700 mt-1">{thread.ai_reply_suggested}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 mt-4 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleUpvote(thread.id)}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Upvote ({thread.upvotes})
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Reply ({thread.reply_count})
                </Button>
                <Button size="sm" variant="outline">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}