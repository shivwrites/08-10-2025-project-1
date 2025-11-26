-- Create skill_watchlist_history table to track historical metrics for watched skills
CREATE TABLE IF NOT EXISTS skill_watchlist_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    demand_score INTEGER,
    growth_rate NUMERIC(5, 2),
    salary_impact NUMERIC(5, 2),
    job_count INTEGER,
    trend VARCHAR(20), -- rising, falling, stable
    emerging_status VARCHAR(20), -- hot, emerging, established, declining
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_history_user_id ON skill_watchlist_history(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_history_skill_id ON skill_watchlist_history(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_history_recorded_at ON skill_watchlist_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_history_user_skill ON skill_watchlist_history(user_id, skill_id);

-- Enable Row Level Security
ALTER TABLE skill_watchlist_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own watchlist history
CREATE POLICY "Users can view their own watchlist history"
    ON skill_watchlist_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own watchlist history
CREATE POLICY "Users can insert their own watchlist history"
    ON skill_watchlist_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own watchlist history
CREATE POLICY "Users can delete their own watchlist history"
    ON skill_watchlist_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to automatically record history when a skill is added to watchlist
-- This will be called via application logic, not as a trigger

-- Function to get latest metrics for a skill
CREATE OR REPLACE FUNCTION get_latest_skill_metrics(p_user_id UUID, p_skill_id INTEGER)
RETURNS TABLE (
    demand_score INTEGER,
    growth_rate NUMERIC,
    salary_impact NUMERIC,
    job_count INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.demand_score,
        h.growth_rate,
        h.salary_impact,
        h.job_count,
        h.recorded_at
    FROM skill_watchlist_history h
    WHERE h.user_id = p_user_id 
      AND h.skill_id = p_skill_id
    ORDER BY h.recorded_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get historical data for a skill (last N days)
CREATE OR REPLACE FUNCTION get_skill_history(p_user_id UUID, p_skill_id INTEGER, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    demand_score INTEGER,
    growth_rate NUMERIC,
    salary_impact NUMERIC,
    job_count INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.demand_score,
        h.growth_rate,
        h.salary_impact,
        h.job_count,
        h.recorded_at
    FROM skill_watchlist_history h
    WHERE h.user_id = p_user_id 
      AND h.skill_id = p_skill_id
      AND h.recorded_at >= NOW() - (p_days || ' days')::INTERVAL
    ORDER BY h.recorded_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

