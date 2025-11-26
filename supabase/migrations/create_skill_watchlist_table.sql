-- Create skill_watchlist table to store user's watched skills
CREATE TABLE IF NOT EXISTS skill_watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    tags TEXT[], -- Array of tags for grouping/categorization
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, skill_id) -- Prevent duplicate entries
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_user_id ON skill_watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_skill_id ON skill_watchlist(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_watchlist_added_at ON skill_watchlist(added_at DESC);

-- Enable Row Level Security
ALTER TABLE skill_watchlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own watchlist
CREATE POLICY "Users can view their own watchlist"
    ON skill_watchlist
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own watchlist items
CREATE POLICY "Users can insert their own watchlist items"
    ON skill_watchlist
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist items
CREATE POLICY "Users can update their own watchlist items"
    ON skill_watchlist
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own watchlist items
CREATE POLICY "Users can delete their own watchlist items"
    ON skill_watchlist
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_skill_watchlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_skill_watchlist_updated_at
    BEFORE UPDATE ON skill_watchlist
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_watchlist_updated_at();

