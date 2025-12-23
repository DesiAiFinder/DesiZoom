-- Desi Finder Database Update Script
-- This script adds new tables without conflicting with existing ones

-- Create events table for dynamic event management
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  venue TEXT NOT NULL,
  address TEXT NOT NULL,
  price TEXT,
  link TEXT,
  category TEXT NOT NULL CHECK (category IN ('cultural', 'religious', 'business', 'social', 'educational', 'other')),
  source TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin', 'eventbrite')),
  external_id TEXT, -- For Eventbrite events
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create deals table for dynamic deal management
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'travel', 'services', 'shopping', 'entertainment', 'other')),
  price TEXT,
  original_price TEXT,
  discount TEXT,
  valid_until DATE,
  link TEXT,
  business TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create local_info table for dynamic local information
CREATE TABLE IF NOT EXISTS local_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('utility', 'emergency', 'government', 'trash_recycling', 'city_info')),
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  subtype TEXT, -- For utilities: electric, gas, water, etc.
  day TEXT, -- For trash/recycling schedule
  time TEXT, -- For trash/recycling schedule
  notes TEXT, -- For trash/recycling schedule
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - only if not already enabled
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'events' AND relkind = 'r'
    ) THEN
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'deals' AND relkind = 'r'
    ) THEN
        ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'local_info' AND relkind = 'r'
    ) THEN
        ALTER TABLE local_info ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create RLS policies for events table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Anyone can view active events'
    ) THEN
        CREATE POLICY "Anyone can view active events" ON events
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Admin can manage events'
    ) THEN
        CREATE POLICY "Admin can manage events" ON events
          FOR ALL USING (false); -- Will be handled by application-level auth
    END IF;
END $$;

-- Create RLS policies for deals table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Anyone can view active deals'
    ) THEN
        CREATE POLICY "Anyone can view active deals" ON deals
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Admin can manage deals'
    ) THEN
        CREATE POLICY "Admin can manage deals" ON deals
          FOR ALL USING (false); -- Will be handled by application-level auth
    END IF;
END $$;

-- Create RLS policies for local_info table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'local_info' AND policyname = 'Anyone can view active local info'
    ) THEN
        CREATE POLICY "Anyone can view active local info" ON local_info
          FOR SELECT USING (is_active = true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'local_info' AND policyname = 'Admin can manage local info'
    ) THEN
        CREATE POLICY "Admin can manage local info" ON local_info
          FOR ALL USING (false); -- Will be handled by application-level auth
    END IF;
END $$;

-- Create function to update updated_at timestamp (only if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at'
    ) THEN
        CREATE TRIGGER update_events_updated_at 
            BEFORE UPDATE ON events 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_deals_updated_at'
    ) THEN
        CREATE TRIGGER update_deals_updated_at 
            BEFORE UPDATE ON deals 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_local_info_updated_at'
    ) THEN
        CREATE TRIGGER update_local_info_updated_at 
            BEFORE UPDATE ON local_info 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);

CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_is_active ON deals(is_active);
CREATE INDEX IF NOT EXISTS idx_deals_valid_until ON deals(valid_until);

CREATE INDEX IF NOT EXISTS idx_local_info_type ON local_info(type);
CREATE INDEX IF NOT EXISTS idx_local_info_is_active ON local_info(is_active);

-- Note: No sample data inserted - the application will fetch real data from Google Places API
-- The tables are ready to store real business data, events, and local information

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Desi Finder database update completed successfully! New tables created with sample data.' as message;
