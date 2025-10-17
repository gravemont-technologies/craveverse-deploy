// Dashboard header component
'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Settings, 
  LogOut, 
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { User } from '../lib/types';

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useClerk();

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultra':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'plus':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
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

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-crave-orange">CraveVerse</h1>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.username || 'User'}</div>
                <div className="flex items-center space-x-1">
                  <Badge className={getTierColor(user.plan_id)}>
                    {getTierIcon(user.plan_id)}
                    <span className="ml-1">{user.plan_id.toUpperCase()}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}


