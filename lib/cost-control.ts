// Cost control system for OpenAI usage
import { createClient } from '@supabase/supabase-js';
import { CONFIG } from './config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CostControlConfig {
  userTier: string;
  monthlyBudget: number;
  currentSpend: number;
  remainingBudget: number;
  isOverBudget: boolean;
  lastResetDate: string;
  nextResetDate: string;
}

export class CostController {
  private userId: string;
  private userTier: string;

  constructor(userId: string, userTier: string) {
    this.userId = userId;
    this.userTier = userTier;
  }

  async getCostStatus(): Promise<CostControlConfig> {
    const monthlyBudget = this.userTier === 'free' 
      ? CONFIG.AI.BUDGETS.FREE_TIER_MAX 
      : CONFIG.AI.BUDGETS.MONTHLY_PER_USER;

    // Get current month's spending
    const { data: usage, error } = await supabase
      .from('ai_usage_log')
      .select('cost_usd')
      .eq('user_id', this.userId)
      .gte('created_at', this.getMonthStart().toISOString());

    if (error) {
      console.error('Error fetching AI usage:', error);
      throw new Error('Failed to fetch cost status');
    }

    const currentSpend = usage?.reduce((sum, record) => sum + record.cost_usd, 0) || 0;
    const remainingBudget = Math.max(0, monthlyBudget - currentSpend);
    const isOverBudget = currentSpend >= monthlyBudget;

    return {
      userTier: this.userTier,
      monthlyBudget,
      currentSpend,
      remainingBudget,
      isOverBudget,
      lastResetDate: this.getMonthStart().toISOString(),
      nextResetDate: this.getNextMonthStart().toISOString(),
    };
  }

  async canMakeAICall(feature: string, estimatedCost: number = 0.001): Promise<boolean> {
    const costStatus = await this.getCostStatus();
    
    if (costStatus.isOverBudget) {
      return false;
    }

    // Check if this call would exceed budget
    if (costStatus.currentSpend + estimatedCost > costStatus.monthlyBudget) {
      return false;
    }

    // Check feature-specific limits
    const featureLimits = this.getFeatureLimits(feature);
    if (featureLimits.dailyLimit > 0) {
      const todayUsage = await this.getTodayUsage(feature);
      if (todayUsage >= featureLimits.dailyLimit) {
        return false;
      }
    }

    return true;
  }

  async recordAICall(cost: number, feature: string, model: string, tokens: number): Promise<void> {
    const { error } = await supabase
      .from('ai_usage_log')
      .insert({
        user_id: this.userId,
        model_used: model,
        prompt_tokens: Math.floor(tokens * 0.7), // Estimate prompt tokens
        completion_tokens: Math.floor(tokens * 0.3), // Estimate completion tokens
        cost_usd: cost,
        feature: feature,
      });

    if (error) {
      console.error('Error recording AI usage:', error);
      throw new Error('Failed to record AI usage');
    }
  }

  async getFallbackResponse(feature: string): Promise<string> {
    const fallbacks = {
      level_feedback: [
        "Great job! Keep up the excellent work!",
        "You're making fantastic progress!",
        "Every step counts - you're doing amazing!",
        "Stay strong and keep pushing forward!",
        "Your dedication is inspiring!",
      ],
      forum_reply: [
        "Thanks for sharing your experience!",
        "That's a great perspective on this topic.",
        "I appreciate you taking the time to respond.",
        "Your input is really valuable to the community.",
        "Thanks for contributing to the discussion!",
      ],
      battle_task_generation: [
        "Complete a 10-minute mindfulness exercise",
        "Write down 3 things you're grateful for",
        "Take a 5-minute walk outside",
        "Practice deep breathing for 5 minutes",
        "Write a positive affirmation for yourself",
      ],
      onboarding_personalization: [
        "Welcome to your journey! We're excited to support you every step of the way.",
        "Your commitment to change is the first and most important step.",
        "Remember, progress isn't always linear - every effort counts.",
        "You've got this! We believe in your ability to succeed.",
        "Welcome aboard! Let's make this journey together.",
      ],
    };

    const featureFallbacks = fallbacks[feature as keyof typeof fallbacks] || fallbacks.onboarding_personalization;
    return featureFallbacks[Math.floor(Math.random() * featureFallbacks.length)];
  }

  private getFeatureLimits(feature: string): { dailyLimit: number; hourlyLimit: number } {
    const limits = {
      level_feedback: { dailyLimit: 10, hourlyLimit: 3 },
      forum_reply: { dailyLimit: 5, hourlyLimit: 2 },
      battle_task_generation: { dailyLimit: 3, hourlyLimit: 1 },
      onboarding_personalization: { dailyLimit: 1, hourlyLimit: 1 },
      ai_weekly_summary: { dailyLimit: 1, hourlyLimit: 1 },
    };

    return limits[feature as keyof typeof limits] || { dailyLimit: 5, hourlyLimit: 2 };
  }

  private async getTodayUsage(feature: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: usage, error } = await supabase
      .from('ai_usage_log')
      .select('id')
      .eq('user_id', this.userId)
      .eq('feature', feature)
      .gte('created_at', today.toISOString());

    if (error) {
      console.error('Error fetching today usage:', error);
      return 0;
    }

    return usage?.length || 0;
  }

  private getMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}

export async function enforceCostControl(
  userId: string, 
  userTier: string, 
  feature: string, 
  estimatedCost: number = 0.001
): Promise<{ allowed: boolean; fallback?: string }> {
  const controller = new CostController(userId, userTier);
  
  const canCall = await controller.canMakeAICall(feature, estimatedCost);
  
  if (canCall) {
    return { allowed: true };
  } else {
    const fallback = await controller.getFallbackResponse(feature);
    return { allowed: false, fallback };
  }
}

export async function recordAICost(
  userId: string,
  userTier: string,
  cost: number,
  feature: string,
  model: string,
  tokens: number
): Promise<void> {
  const controller = new CostController(userId, userTier);
  await controller.recordAICall(cost, feature, model, tokens);
}


