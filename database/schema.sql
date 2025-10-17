-- CraveVerse Database Schema
-- This file contains the complete database schema for the CraveVerse application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE file_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE relationship_type AS ENUM ('personal', 'professional', 'social');
CREATE TYPE relationship_status AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE insight_impact AS ENUM ('positive', 'neutral', 'negative');

-- Files table - stores uploaded files and their processing status
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  status file_status DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relationships table - stores user's relationships
CREATE TABLE relationships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type relationship_type NOT NULL,
  status relationship_status DEFAULT 'active',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insights table - stores AI-generated insights
CREATE TABLE insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  impact insight_impact DEFAULT 'neutral',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table - stores additional user information
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table - tracks user actions
CREATE TABLE activity_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);

CREATE INDEX idx_relationships_user_id ON relationships(user_id);
CREATE INDEX idx_relationships_type ON relationships(type);
CREATE INDEX idx_relationships_status ON relationships(status);

CREATE INDEX idx_insights_user_id ON insights(user_id);
CREATE INDEX idx_insights_file_id ON insights(file_id);
CREATE INDEX idx_insights_relationship_id ON insights(relationship_id);
CREATE INDEX idx_insights_type ON insights(type);
CREATE INDEX idx_insights_impact ON insights(impact);
CREATE INDEX idx_insights_created_at ON insights(created_at);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for files
CREATE POLICY "Users can view their own files" ON files
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own files" ON files
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own files" ON files
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own files" ON files
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for relationships
CREATE POLICY "Users can view their own relationships" ON relationships
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own relationships" ON relationships
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own relationships" ON relationships
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own relationships" ON relationships
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for insights
CREATE POLICY "Users can view their own insights" ON insights
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own insights" ON insights
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own insights" ON insights
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own insights" ON insights
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid()::text = user_id);

-- Create RLS policies for activity_log
CREATE POLICY "Users can view their own activity" ON activity_log
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own activity" ON activity_log
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
    FOR SELECT USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create functions for common operations

-- Function to get user's file statistics
CREATE OR REPLACE FUNCTION get_user_file_stats(user_id_param TEXT)
RETURNS TABLE (
    total_files BIGINT,
    pending_files BIGINT,
    processing_files BIGINT,
    completed_files BIGINT,
    failed_files BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_files,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_files,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_files,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_files,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_files
    FROM files
    WHERE files.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's relationship statistics
CREATE OR REPLACE FUNCTION get_user_relationship_stats(user_id_param TEXT)
RETURNS TABLE (
    total_relationships BIGINT,
    active_relationships BIGINT,
    personal_relationships BIGINT,
    professional_relationships BIGINT,
    social_relationships BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_relationships,
        COUNT(*) FILTER (WHERE status = 'active') as active_relationships,
        COUNT(*) FILTER (WHERE type = 'personal') as personal_relationships,
        COUNT(*) FILTER (WHERE type = 'professional') as professional_relationships,
        COUNT(*) FILTER (WHERE type = 'social') as social_relationships
    FROM relationships
    WHERE relationships.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's insight statistics
CREATE OR REPLACE FUNCTION get_user_insight_stats(user_id_param TEXT)
RETURNS TABLE (
    total_insights BIGINT,
    positive_insights BIGINT,
    neutral_insights BIGINT,
    negative_insights BIGINT,
    avg_confidence NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_insights,
        COUNT(*) FILTER (WHERE impact = 'positive') as positive_insights,
        COUNT(*) FILTER (WHERE impact = 'neutral') as neutral_insights,
        COUNT(*) FILTER (WHERE impact = 'negative') as negative_insights,
        AVG(confidence) as avg_confidence
    FROM insights
    WHERE insights.user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    user_id_param TEXT,
    action_param TEXT,
    resource_type_param TEXT DEFAULT NULL,
    resource_id_param UUID DEFAULT NULL,
    metadata_param JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO activity_log (user_id, action, resource_type, resource_id, metadata)
    VALUES (user_id_param, action_param, resource_type_param, resource_id_param, metadata_param)
    RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create views for common queries

-- View for file details with relationship info
CREATE VIEW file_details AS
SELECT 
    f.*,
    r.name as relationship_name,
    r.type as relationship_type
FROM files f
LEFT JOIN relationships r ON f.metadata->>'relationship_id' = r.id::text;

-- View for insight details with file and relationship info
CREATE VIEW insight_details AS
SELECT 
    i.*,
    f.name as file_name,
    f.type as file_type,
    r.name as relationship_name,
    r.type as relationship_type
FROM insights i
LEFT JOIN files f ON i.file_id = f.id
LEFT JOIN relationships r ON i.relationship_id = r.id;

-- View for user dashboard data
CREATE VIEW user_dashboard AS
SELECT 
    up.user_id,
    up.name,
    up.email,
    up.avatar_url,
    COALESCE(fs.total_files, 0) as total_files,
    COALESCE(fs.completed_files, 0) as completed_files,
    COALESCE(rs.total_relationships, 0) as total_relationships,
    COALESCE(rs.active_relationships, 0) as active_relationships,
    COALESCE(ins.total_insights, 0) as total_insights,
    COALESCE(ins.avg_confidence, 0) as avg_confidence
FROM user_profiles up
LEFT JOIN LATERAL get_user_file_stats(up.user_id) fs ON true
LEFT JOIN LATERAL get_user_relationship_stats(up.user_id) rs ON true
LEFT JOIN LATERAL get_user_insight_stats(up.user_id) ins ON true;

-- Insert sample data (optional - for development)
-- Uncomment the following lines to insert sample data for testing

/*
-- Sample user profile
INSERT INTO user_profiles (user_id, name, email) VALUES 
('sample-user-1', 'John Doe', 'john@example.com');

-- Sample relationships
INSERT INTO relationships (user_id, name, type, description) VALUES 
('sample-user-1', 'Sarah Johnson', 'professional', 'Colleague at work'),
('sample-user-1', 'Mike Wilson', 'personal', 'Close friend'),
('sample-user-1', 'Lisa Chen', 'social', 'Gym buddy');

-- Sample files
INSERT INTO files (user_id, name, type, size, status, metadata) VALUES 
('sample-user-1', 'conversation_analysis.txt', 'text/plain', 2400, 'completed', '{"relationship_id": "sample-relationship-1"}'),
('sample-user-1', 'meeting_notes.pdf', 'application/pdf', 1200000, 'processing', '{"relationship_id": "sample-relationship-2"}');

-- Sample insights
INSERT INTO insights (user_id, file_id, type, title, description, confidence, impact, metadata) VALUES 
('sample-user-1', (SELECT id FROM files WHERE name = 'conversation_analysis.txt'), 'communication', 'Communication Style Analysis', 'Your communication has become 23% more empathetic over the past month.', 87, 'positive', '{"trend": "up"}'),
('sample-user-1', (SELECT id FROM files WHERE name = 'conversation_analysis.txt'), 'relationship', 'Relationship Health Score', 'Your relationship with Sarah has improved significantly.', 92, 'positive', '{"relationship_id": "sample-relationship-1"}');
*/
