// Trial banner component
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, Crown, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TrialBannerProps {
  userTier: string;
  trialEnd?: string;
  onTrialStart?: () => void;
}

export function TrialBanner({ userTier, trialEnd, onTrialStart }: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Show banner if user is on free tier and hasn't started a trial
    if (userTier === 'free' && !trialEnd) {
      setIsVisible(true);
    }
  }, [userTier, trialEnd]);

  useEffect(() => {
    if (trialEnd) {
      const updateTimeRemaining = () => {
        const endTime = new Date(trialEnd);
        const now = new Date();
        const diff = endTime.getTime() - now.getTime();
        
        if (diff > 0) {
          setTimeRemaining(formatDistanceToNow(endTime, { addSuffix: true }));
        } else {
          setTimeRemaining('Trial expired');
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [trialEnd]);

  const handleStartTrial = async (planId: string) => {
    try {
      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        setIsVisible(false);
        onTrialStart?.();
      } else {
        const errorData = await response.json();
        console.error('Error starting trial:', errorData.error);
      }
    } catch (error) {
      console.error('Error starting trial:', error);
    }
  };

  if (!isVisible && !trialEnd) {
    return null;
  }

  return (
    <Card className={`mb-6 ${
      trialEnd 
        ? 'border-crave-orange/20 bg-crave-orange/5' 
        : 'border-blue-200 bg-blue-50/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {trialEnd ? (
              <>
                <Clock className="h-5 w-5 text-crave-orange" />
                <div>
                  <p className="font-semibold text-crave-orange">
                    Trial Active
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {timeRemaining}
                  </p>
                </div>
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-600">
                    Start Your Free Trial
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try premium features for 14 days
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {trialEnd ? (
              <Badge className="bg-crave-orange/10 text-crave-orange border-crave-orange/20">
                <Zap className="h-3 w-3 mr-1" />
                Trial Active
              </Badge>
            ) : (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartTrial('plus')}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Try Plus
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStartTrial('ultra')}
                  className="bg-crave-orange hover:bg-crave-orange-dark"
                >
                  Try Ultra
                </Button>
              </div>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!trialEnd && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <h4 className="font-medium text-blue-600">Plus Trial Includes:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• All 30 levels unlocked</li>
                  <li>• 1v1 battles</li>
                  <li>• Advanced analytics</li>
                  <li>• Streak recovery</li>
                </ul>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-crave-orange">Ultra Trial Includes:</h4>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Everything in Plus</li>
                  <li>• Personal AI coach</li>
                  <li>• Real-world rewards</li>
                  <li>• Unlimited battles</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}








