-- Create goals table for AI Personal Brand Audit
CREATE TABLE IF NOT EXISTS brand_audit_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    target_value NUMERIC,
    current_value NUMERIC DEFAULT 0,
    target_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    linked_recommendation_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_brand_audit_goals_user_id ON brand_audit_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_audit_goals_status ON brand_audit_goals(status);
CREATE INDEX IF NOT EXISTS idx_brand_audit_goals_category ON brand_audit_goals(category);

-- Enable Row Level Security
ALTER TABLE brand_audit_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own goals"
    ON brand_audit_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON brand_audit_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON brand_audit_goals FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON brand_audit_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_audit_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_brand_audit_goals_updated_at
    BEFORE UPDATE ON brand_audit_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_audit_goals_updated_at();


