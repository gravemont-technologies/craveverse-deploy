// Level detail modal for completing levels
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Zap, Clock, CheckCircle } from 'lucide-react';

interface Level {
  id: string;
  level_number: number;
  title: string;
  description: string;
  challenge_text: string;
  xp_reward: number;
  coin_reward: number;
  difficulty: string;
}

interface LevelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: Level;
  userResponse: string;
  setUserResponse: (value: string) => void;
  onComplete: () => void;
  isCompleting: boolean;
}

export function LevelDetailModal({
  isOpen,
  onClose,
  level,
  userResponse,
  setUserResponse,
  onComplete,
  isCompleting,
}: LevelDetailModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleComplete = async () => {
    await onComplete();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Level Completed!</h3>
              <p className="text-sm text-muted-foreground">
                Great job! You've earned {level.xp_reward} XP and {level.coin_reward} Coins.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{level.title}</DialogTitle>
              <DialogDescription className="mt-2">
                {level.description}
              </DialogDescription>
            </div>
            <Badge className={getDifficultyColor(level.difficulty)}>
              {level.difficulty}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Your Challenge:</h4>
            <p className="text-sm">{level.challenge_text}</p>
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-between p-4 bg-crave-orange/10 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{level.xp_reward} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-crave-orange" />
                <span className="text-sm font-medium">{level.coin_reward} Coins</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>~15 min</span>
            </div>
          </div>

          {/* User Response */}
          <div className="space-y-3">
            <label htmlFor="response" className="text-sm font-medium">
              Share your experience:
            </label>
            <Textarea
              id="response"
              placeholder="Describe how you completed the challenge, what you learned, or any insights you gained..."
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Your response helps our AI provide personalized feedback and track your progress.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!userResponse.trim() || isCompleting}
              className="bg-crave-orange hover:bg-crave-orange-dark"
            >
              {isCompleting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Completing...</span>
                </div>
              ) : (
                'Complete Level'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
