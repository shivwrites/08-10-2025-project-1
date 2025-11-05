-- Complete SQL script to create Content Analytics tables
-- Run this in Supabase Dashboard > SQL Editor

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Main content analytics table
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('post', 'article', 'thread', 'other')),
    platform TEXT,
    title TEXT,
    content_preview TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content performance metrics
CREATE TABLE IF NOT EXISTS content_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analytics_id UUID NOT NULL REFERENCES content_analytics(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5, 2) DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content generation statistics
CREATE TABLE IF NOT EXISTS content_generation_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_generated INTEGER DEFAULT 0,
    posts_generated INTEGER DEFAULT 0,
    articles_generated INTEGER DEFAULT 0,
    threads_generated INTEGER DEFAULT 0,
    total_words INTEGER DEFAULT 0,
    expertise_areas_used TEXT[],
    platforms_targeted TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Scheduled content tracking
CREATE TABLE IF NOT EXISTS scheduled_content_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    platform TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    published_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_content_analytics_user_id ON content_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_created_at ON content_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_analytics_platform ON content_analytics(platform);

CREATE INDEX IF NOT EXISTS idx_content_performance_analytics_id ON content_performance(analytics_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_recorded_at ON content_performance(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_generation_stats_user_id ON content_generation_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generation_stats_date ON content_generation_stats(date DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_content_tracking_user_id ON scheduled_content_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_tracking_scheduled_date ON scheduled_content_tracking(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_content_tracking_status ON scheduled_content_tracking(status);

-- Enable Row Level Security
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_generation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_content_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DROP POLICY IF EXISTS "Users can view their own content analytics" ON content_analytics;
DROP POLICY IF EXISTS "Users can insert their own content analytics" ON content_analytics;
DROP POLICY IF EXISTS "Users can update their own content analytics" ON content_analytics;
DROP POLICY IF EXISTS "Users can delete their own content analytics" ON content_analytics;

DROP POLICY IF EXISTS "Users can view their own content performance" ON content_performance;
DROP POLICY IF EXISTS "Users can insert their own content performance" ON content_performance;
DROP POLICY IF EXISTS "Users can update their own content performance" ON content_performance;

DROP POLICY IF EXISTS "Users can view their own generation stats" ON content_generation_stats;
DROP POLICY IF EXISTS "Users can insert their own generation stats" ON content_generation_stats;
DROP POLICY IF EXISTS "Users can update their own generation stats" ON content_generation_stats;

DROP POLICY IF EXISTS "Users can view their own scheduled content" ON scheduled_content_tracking;
DROP POLICY IF EXISTS "Users can insert their own scheduled content" ON scheduled_content_tracking;
DROP POLICY IF EXISTS "Users can update their own scheduled content" ON scheduled_content_tracking;
DROP POLICY IF EXISTS "Users can delete their own scheduled content" ON scheduled_content_tracking;

-- RLS Policies for content_analytics
CREATE POLICY "Users can view their own content analytics"
    ON content_analytics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content analytics"
    ON content_analytics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content analytics"
    ON content_analytics FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content analytics"
    ON content_analytics FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for content_performance
CREATE POLICY "Users can view their own content performance"
    ON content_performance FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM content_analytics
            WHERE content_analytics.id = content_performance.analytics_id
            AND content_analytics.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own content performance"
    ON content_performance FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM content_analytics
            WHERE content_analytics.id = content_performance.analytics_id
            AND content_analytics.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own content performance"
    ON content_performance FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM content_analytics
            WHERE content_analytics.id = content_performance.analytics_id
            AND content_analytics.user_id = auth.uid()
        )
    );

-- RLS Policies for content_generation_stats
CREATE POLICY "Users can view their own generation stats"
    ON content_generation_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generation stats"
    ON content_generation_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generation stats"
    ON content_generation_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for scheduled_content_tracking
CREATE POLICY "Users can view their own scheduled content"
    ON scheduled_content_tracking FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled content"
    ON scheduled_content_tracking FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content"
    ON scheduled_content_tracking FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content"
    ON scheduled_content_tracking FOR DELETE
    USING (auth.uid() = user_id);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_content_analytics_updated_at ON content_analytics;
DROP TRIGGER IF EXISTS update_content_performance_updated_at ON content_performance;
DROP TRIGGER IF EXISTS update_content_generation_stats_updated_at ON content_generation_stats;
DROP TRIGGER IF EXISTS update_scheduled_content_tracking_updated_at ON scheduled_content_tracking;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_content_analytics_updated_at
    BEFORE UPDATE ON content_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_performance_updated_at
    BEFORE UPDATE ON content_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_generation_stats_updated_at
    BEFORE UPDATE ON content_generation_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_content_tracking_updated_at
    BEFORE UPDATE ON scheduled_content_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate engagement rate
CREATE OR REPLACE FUNCTION calculate_engagement_rate(
    views INTEGER,
    likes INTEGER,
    comments INTEGER,
    shares INTEGER
) RETURNS DECIMAL(5, 2) AS $$
BEGIN
    IF views = 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND(((likes + comments + shares)::DECIMAL / views) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to automatically update engagement rate
CREATE OR REPLACE FUNCTION update_engagement_rate()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engagement_rate = calculate_engagement_rate(
        NEW.views,
        NEW.likes,
        NEW.comments,
        NEW.shares
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_content_performance_engagement_rate ON content_performance;

-- Trigger to auto-calculate engagement rate
CREATE TRIGGER update_content_performance_engagement_rate
    BEFORE INSERT OR UPDATE ON content_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_engagement_rate();

