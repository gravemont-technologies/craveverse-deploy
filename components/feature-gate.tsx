// Feature gate component for paywall
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Zap } from 'lucide-react';
import { FEATURE_GATES, getRequiredTier } from '../lib/feature-gates';
import { PRICING_TIERS } from '../lib/config';

interface FeatureGateProps {
  featureName: string;
  children: React.ReactNode;
  userTier: string;
  showUpgrade?: boolean;
  className?: string;
}

export function FeatureGate({ 
  featureName, 
  children, 
  userTier, 
  showUpgrade = true,
  className = ''
}: FeatureGateProps) {
  const feature = FEATURE_GATES[featureName];
  
  if (!feature) {
    console.warn(`Unknown feature: ${featureName}`);
    return <>{children}</>;
  }

  const isEnabled = feature.isEnabled(userTier);
  const requiredTier = getRequiredTier(featureName);
  const requiredTierInfo = PRICING_TIERS[requiredTier.toUpperCase() as keyof typeof PRICING_TIERS];

  if (isEnabled) {
    return <>{children}</>;
  }

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'plus':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'ultra':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'plus':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ultra':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none">
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lock className="h-6 w-6 text-crave-orange" />
              <CardTitle className="text-lg">Premium Feature</CardTitle>
            </div>
            <CardDescription>
              {feature.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Required Tier Badge */}
            <div className="flex justify-center">
              <Badge className={`${getTierColor(requiredTier)} flex items-center space-x-1`}>
                {getTierIcon(requiredTier)}
                <span>{requiredTierInfo?.name || requiredTier.toUpperCase()}</span>
              </Badge>
            </div>

            {/* Upgrade Message */}
            <div className="text-center text-sm text-muted-foreground">
              {feature.getUpgradeMessage(userTier)}
            </div>

            {/* Upgrade Button */}
            {showUpgrade && (
              <div className="space-y-2">
                <Button 
                  className="w-full bg-crave-orange hover:bg-crave-orange-dark"
                  onClick={() => window.location.href = '/pricing'}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to {requiredTierInfo?.name}
                </Button>
                
                <div className="text-xs text-center text-muted-foreground">
                  {requiredTierInfo && (
                    <>
                      Starting at ${requiredTierInfo.price_monthly_usd}/month
                      <br />
                      14-day free trial • Cancel anytime
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


