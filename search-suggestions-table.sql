-- Create search_suggestions table for auto-suggestions and trending searches
CREATE TABLE IF NOT EXISTS search_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    query TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'unknown',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    radius_km INTEGER DEFAULT 10,
    count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query ON search_suggestions(query);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_location ON search_suggestions(location);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_count ON search_suggestions(count DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query_location ON search_suggestions(query, location);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_coordinates ON search_suggestions(latitude, longitude);

-- Create unique constraint to prevent duplicate queries for same location
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_suggestions_unique_query_location 
ON search_suggestions(query, location);

-- Enable RLS (Row Level Security)
ALTER TABLE search_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for search_suggestions table
-- Allow everyone to read search suggestions
CREATE POLICY "Allow public read access to search suggestions" ON search_suggestions
    FOR SELECT USING (true);

-- Allow authenticated users to insert search suggestions
CREATE POLICY "Allow authenticated users to insert search suggestions" ON search_suggestions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update search suggestions
CREATE POLICY "Allow authenticated users to update search suggestions" ON search_suggestions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_search_suggestions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_search_suggestions_updated_at
    BEFORE UPDATE ON search_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_search_suggestions_updated_at();

-- Insert some sample data for testing
INSERT INTO search_suggestions (query, location, count) VALUES
('i want to buy iphone', 'mumbai', 15),
('looking for used car', 'mumbai', 12),
('best laptop deals', 'mumbai', 8),
('i want to buy iphone', 'delhi', 20),
('cheap mobile phones', 'delhi', 18),
('used bikes for sale', 'delhi', 10),
('i want to buy iphone', 'bangalore', 25),
('laptop computer deals', 'bangalore', 14),
('smartphone accessories', 'bangalore', 7)
ON CONFLICT (query, location) DO NOTHING;
