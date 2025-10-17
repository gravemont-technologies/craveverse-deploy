// Type definitions for CraveVerse

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  username?: string;
  current_craving_id?: string;
  xp: number;
  crave_coins: number;
  streak_days: number;
  last_level_completed_at?: string;
  onboarding_completed: boolean;
  plan_id: string;
  openai_monthly_cost_usd: number;
  token_budget_reset_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Craving {
  id: string;
  name: string;
  description?: string;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LevelTemplate {
  id: string;
  craving_id: string;
  level_number: number;
  title: string;
  description: string;
  rules: string[];
  xp_reward: number;
  coin_reward: number;
  ai_feedback_template?: string;
  created_at: string;
  updated_at: string;
}

export interface UserLevel {
  id: string;
  user_id: string;
  craving_id: string;
  level_template_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'relapsed';
  started_at: string;
  completed_at?: string;
  ai_feedback?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  user_id: string;
  craving_id: string;
  title: string;
  content: string;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  ai_suggested_reply: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
}

export interface Battle {
  id: string;
  challenger_id: string;
  opponent_id: string;
  craving_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  winner_id?: string;
  tasks: Record<string, any>;
  challenger_progress: Record<string, any>;
  opponent_progress: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'subscription' | 'coin_purchase' | 'pause_token_purchase' | 'level_skip_purchase';
  amount: number;
  crave_coins_gained: number;
  stripe_session_id?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface AIUsageLog {
  id: string;
  user_id: string;
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
  feature: string;
  created_at: string;
}

export interface AIContextSummary {
  id: string;
  user_id: string;
  craving_id: string;
  summary: string;
  last_updated_at: string;
  created_at: string;
}

export interface PauseToken {
  id: string;
  user_id: string;
  token_count: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AdminMetrics {
  id: string;
  metric_name: string;
  metric_value: Record<string, any>;
  last_updated_at: string;
}


