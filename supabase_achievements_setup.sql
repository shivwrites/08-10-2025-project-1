-- Achievement System Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the achievements system

-- Create achievement_definitions table
CREATE TABLE IF NOT EXISTS achievement_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('brand_score', 'engagement', 'profile_completion', 'consistency')),
    icon TEXT NOT NULL,
    criteria_type TEXT NOT NULL CHECK (criteria_type IN ('score_threshold', 'metric_threshold', 'completeness', 'consistency')),
    criteria_value JSONB NOT NULL,
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_code TEXT NOT NULL REFERENCES achievement_definitions(code) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress_data JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_code)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON achievement_definitions(category);

-- Insert initial achievement definitions
INSERT INTO achievement_definitions (code, name, description, category, icon, criteria_type, criteria_value, rarity) VALUES
-- Brand Score Achievements
('BRAND_SCORE_60', 'Brand Builder', 'Achieve an overall brand score of 60 or higher', 'brand_score', '🏗️', 'score_threshold', '{"threshold": 60, "metric": "overall"}', 'common'),
('BRAND_SCORE_70', 'Brand Rising', 'Achieve an overall brand score of 70 or higher', 'brand_score', '📈', 'score_threshold', '{"threshold": 70, "metric": "overall"}', 'common'),
('BRAND_SCORE_80', 'Brand Excellence', 'Achieve an overall brand score of 80 or higher', 'brand_score', '⭐', 'score_threshold', '{"threshold": 80, "metric": "overall"}', 'rare'),
('BRAND_SCORE_90', 'Brand Master', 'Achieve an overall brand score of 90 or higher', 'brand_score', '💎', 'score_threshold', '{"threshold": 90, "metric": "overall"}', 'epic'),
('BRAND_SCORE_95', 'Brand Legend', 'Achieve an overall brand score of 95 or higher', 'brand_score', '👑', 'score_threshold', '{"threshold": 95, "metric": "overall"}', 'legendary'),

-- Engagement Achievements
('ENGAGEMENT_75', 'High Engagement', 'Achieve an engagement score of 75 or higher', 'engagement', '🔥', 'metric_threshold', '{"threshold": 75, "metric": "engagement"}', 'common'),
('ENGAGEMENT_90', 'Engagement Master', 'Achieve an engagement score of 90 or higher', 'engagement', '🎯', 'metric_threshold', '{"threshold": 90, "metric": "engagement"}', 'rare'),

-- Profile Completion Achievements
('PROFILE_80', 'Complete Profile', 'Achieve 80% or more profile completeness', 'profile_completion', '✅', 'completeness', '{"threshold": 80}', 'common'),
('PROFILE_100', 'Profile Perfectionist', 'Achieve 100% profile completeness', 'profile_completion', '💯', 'completeness', '{"threshold": 100}', 'rare'),

-- Consistency Achievements
('CONSISTENCY_7', 'Consistent Creator', 'Maintain activity for 7 consecutive days', 'consistency', '📅', 'consistency', '{"days": 7}', 'common'),
('CONSISTENCY_14', 'Week Warrior', 'Maintain activity for 14 consecutive days', 'consistency', '🏆', 'consistency', '{"days": 14}', 'rare'),
('CONSISTENCY_30', 'Month Master', 'Maintain activity for 30 consecutive days', 'consistency', '🌟', 'consistency', '{"days": 30}', 'epic'),

-- Visibility Achievements
('VISIBILITY_80', 'Visibility Star', 'Achieve a visibility score of 80 or higher', 'engagement', '✨', 'metric_threshold', '{"threshold": 80, "metric": "visibility"}', 'common'),
('VISIBILITY_90', 'Visibility Champion', 'Achieve a visibility score of 90 or higher', 'engagement', '🌟', 'metric_threshold', '{"threshold": 90, "metric": "visibility"}', 'rare'),

-- Professional Presence Achievements
('PRESENCE_85', 'Professional Presence', 'Achieve a professional presence score of 85 or higher', 'engagement', '💼', 'metric_threshold', '{"threshold": 85, "metric": "professional_presence"}', 'common'),
('PRESENCE_95', 'Presence Excellence', 'Achieve a professional presence score of 95 or higher', 'engagement', '🎖️', 'metric_threshold', '{"threshold": 95, "metric": "professional_presence"}', 'rare')

ON CONFLICT (code) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievement_definitions (public read)
DROP POLICY IF EXISTS "Achievement definitions are viewable by everyone" ON achievement_definitions;
CREATE POLICY "Achievement definitions are viewable by everyone" ON achievement_definitions FOR SELECT USING (true);

-- RLS Policies for user_achievements (users can only see their own)
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
CREATE POLICY "Users can insert their own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own achievements" ON user_achievements;
CREATE POLICY "Users can update their own achievements" ON user_achievements FOR UPDATE USING (auth.uid() = user_id);


