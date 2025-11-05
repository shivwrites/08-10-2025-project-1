-- Create brand_audits table
CREATE TABLE IF NOT EXISTS brand_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_data JSONB,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    brand_score JSONB NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    brand_archetype JSONB,
    industry_benchmark JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create brand_recommendations_status table
CREATE TABLE IF NOT EXISTS brand_recommendations_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES brand_audits(id) ON DELETE CASCADE,
    recommendation_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'implemented', 'saved')),
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(audit_id, recommendation_id)
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_brand_audits_user_id ON brand_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_audits_created_at ON brand_audits(created_at DESC);

-- Create index on audit_id for recommendations status
CREATE INDEX IF NOT EXISTS idx_brand_recommendations_status_audit_id ON brand_recommendations_status(audit_id);

-- Enable Row Level Security
ALTER TABLE brand_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_recommendations_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_audits
CREATE POLICY "Users can view their own brand audits"
    ON brand_audits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand audits"
    ON brand_audits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand audits"
    ON brand_audits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand audits"
    ON brand_audits FOR DELETE
    USING (auth.uid() = user_id);

-- Create RLS policies for brand_recommendations_status
CREATE POLICY "Users can view their own recommendation statuses"
    ON brand_recommendations_status FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM brand_audits
            WHERE brand_audits.id = brand_recommendations_status.audit_id
            AND brand_audits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own recommendation statuses"
    ON brand_recommendations_status FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM brand_audits
            WHERE brand_audits.id = brand_recommendations_status.audit_id
            AND brand_audits.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own recommendation statuses"
    ON brand_recommendations_status FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM brand_audits
            WHERE brand_audits.id = brand_recommendations_status.audit_id
            AND brand_audits.user_id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_brand_audits_updated_at
    BEFORE UPDATE ON brand_audits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_recommendations_status_updated_at
    BEFORE UPDATE ON brand_recommendations_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


