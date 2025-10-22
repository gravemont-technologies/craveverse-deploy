-- CraveVerse Complete Database Schema
-- Execute this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE craving_type AS ENUM ('nofap', 'sugar', 'shopping', 'smoking_vaping', 'social_media');
CREATE TYPE subscription_tier AS ENUM ('free', 'plus', 'plus_trial', 'ultra');
CREATE TYPE battle_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'skipped');
CREATE TYPE post_status AS ENUM ('active', 'hidden', 'deleted');
CREATE TYPE ai_model_type AS ENUM ('gpt-5-nano', 'gpt-5-mini');

-- Users table - Extended profile with craving data
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  primary_craving craving_type,
  current_level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  cravecoins INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  subscription_tier subscription_tier DEFAULT 'free',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  ai_summary TEXT, -- Max 200 tokens for AI context
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cravings reference table
CREATE TABLE cravings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type craving_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Levels table - 30 pre-authored templates per craving (150 total)
CREATE TABLE levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  craving_type craving_type NOT NULL,
  level_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_text TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(craving_type, level_number)
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  ai_feedback TEXT,
  user_response TEXT,
  relapse_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_id)
);

-- Battles table - 1v1 matchmaking
CREATE TABLE battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  craving_type craving_type NOT NULL,
  status battle_status DEFAULT 'waiting',
  tasks JSONB, -- Array of 3 task objects
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES users(id),
  user1_tasks_completed INTEGER DEFAULT 0,
  user2_tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle tasks - AI-generated extra challenges, cached for reuse
CREATE TABLE battle_tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  craving_type craving_type NOT NULL,
  task_text TEXT NOT NULL,
  reuse_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum posts
CREATE TABLE forum_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  craving_type craving_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status post_status DEFAULT 'active',
  upvotes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum replies
CREATE TABLE forum_replies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_ai_suggested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage metrics for cost tracking
CREATE TABLE ai_usage_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  model ai_model_type NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,
  prompt_hash TEXT,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pause tokens for subscription management
CREATE TABLE pause_tokens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tokens INTEGER NOT NULL,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shareable progress for social features
CREATE TABLE shareable_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
  share_text TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  subscription_tier subscription_tier,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Queue jobs for background processing
CREATE TABLE queue_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_clerk_user_id ON users(clerk_user_id);
CREATE INDEX idx_users_primary_craving ON users(primary_craving);
CREATE INDEX idx_users_streak_count ON users(streak_count);

CREATE INDEX idx_levels_craving_type ON levels(craving_type);
CREATE INDEX idx_levels_level_number ON levels(level_number);

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_level_id ON user_progress(level_id);
CREATE INDEX idx_user_progress_completed_at ON user_progress(completed_at);

CREATE INDEX idx_battles_user1_id ON battles(user1_id);
CREATE INDEX idx_battles_user2_id ON battles(user2_id);
CREATE INDEX idx_battles_status ON battles(status);
CREATE INDEX idx_battles_craving_type ON battles(craving_type);

CREATE INDEX idx_battle_tasks_craving_type ON battle_tasks(craving_type);

CREATE INDEX idx_forum_posts_craving_type ON forum_posts(craving_type);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at);

CREATE INDEX idx_forum_replies_post_id ON forum_replies(post_id);
CREATE INDEX idx_forum_replies_user_id ON forum_replies(user_id);

CREATE INDEX idx_ai_usage_metrics_user_id ON ai_usage_metrics(user_id);
CREATE INDEX idx_ai_usage_metrics_created_at ON ai_usage_metrics(created_at);

CREATE INDEX idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_scheduled_at ON queue_jobs(scheduled_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pause_tokens_updated_at BEFORE UPDATE ON pause_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE pause_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_user_id);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON user_progress
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own progress" ON user_progress
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can update their own progress" ON user_progress
    FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for battles
CREATE POLICY "Users can view their own battles" ON battles
    FOR SELECT USING (user1_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) 
                      OR user2_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own battles" ON battles
    FOR INSERT WITH CHECK (user1_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can update their own battles" ON battles
    FOR UPDATE USING (user1_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text) 
                      OR user2_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for forum_posts
CREATE POLICY "Users can view all forum posts" ON forum_posts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own forum posts" ON forum_posts
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can update their own forum posts" ON forum_posts
    FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for forum_replies
CREATE POLICY "Users can view all forum replies" ON forum_replies
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own forum replies" ON forum_replies
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can update their own forum replies" ON forum_replies
    FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for ai_usage_metrics
CREATE POLICY "Users can view their own AI usage" ON ai_usage_metrics
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own AI usage" ON ai_usage_metrics
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for pause_tokens
CREATE POLICY "Users can view their own pause tokens" ON pause_tokens
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own pause tokens" ON pause_tokens
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for shareable_progress
CREATE POLICY "Users can view public shareable progress" ON shareable_progress
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own shareable progress" ON shareable_progress
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

CREATE POLICY "Users can insert their own shareable progress" ON shareable_progress
    FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Create RLS policies for payment_transactions
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
    FOR SELECT USING (user_id IN (SELECT id FROM users WHERE clerk_user_id = auth.uid()::text));

-- Insert default cravings data
INSERT INTO cravings (type, name, description, icon, color) VALUES
('nofap', 'NoFap Challenge', 'Overcome pornography addiction and build self-control', 'shield', '#3B82F6'),
('sugar', 'Sugar Detox', 'Break free from sugar addiction and improve health', 'heart', '#EF4444'),
('shopping', 'Shopping Addiction', 'Control compulsive spending and build financial discipline', 'credit-card', '#10B981'),
('smoking_vaping', 'Smoking/Vaping Cessation', 'Quit smoking and vaping for better health', 'lungs', '#F59E0B'),
('social_media', 'Social Media Detox', 'Reduce social media dependency and improve focus', 'smartphone', '#8B5CF6');

-- Create a function to get user by clerk ID
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(clerk_id TEXT)
RETURNS users AS $$
DECLARE
    user_record users;
BEGIN
    SELECT * INTO user_record FROM users WHERE clerk_user_id = clerk_id;
    RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create user from Clerk webhook
CREATE OR REPLACE FUNCTION create_user_from_clerk(
    clerk_id TEXT,
    email TEXT,
    name TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL
)
RETURNS users AS $$
DECLARE
    new_user users;
BEGIN
    INSERT INTO users (clerk_user_id, email, name, avatar_url)
    VALUES (clerk_id, email, name, avatar_url)
    RETURNING * INTO new_user;
    RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update user from Clerk webhook
CREATE OR REPLACE FUNCTION update_user_from_clerk(
    clerk_id TEXT,
    email TEXT DEFAULT NULL,
    name TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL
)
RETURNS users AS $$
DECLARE
    updated_user users;
BEGIN
    UPDATE users 
    SET 
        email = COALESCE(update_user_from_clerk.email, users.email),
        name = COALESCE(update_user_from_clerk.name, users.name),
        avatar_url = COALESCE(update_user_from_clerk.avatar_url, users.avatar_url),
        updated_at = NOW()
    WHERE clerk_user_id = clerk_id
    RETURNING * INTO updated_user;
    RETURN updated_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to delete user from Clerk webhook
CREATE OR REPLACE FUNCTION delete_user_from_clerk(clerk_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM users WHERE clerk_user_id = clerk_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
