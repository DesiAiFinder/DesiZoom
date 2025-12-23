-- Desi Finder Database Setup Script
-- Run this script in your Supabase SQL Editor

-- Create users table for community registration
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin configuration table
CREATE TABLE IF NOT EXISTS admin_config (
  id SERIAL PRIMARY KEY,
  admin_password_hash TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table (optional, for future features)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preferred_categories TEXT[], -- Array of preferred business categories
  search_radius INTEGER DEFAULT 10, -- Default search radius in miles
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_info ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Policy: Anyone can insert new users (for registration)
CREATE POLICY "Anyone can register" ON users
  FOR INSERT WITH CHECK (true);

-- Policy: Users can view their own data (if we add user auth later)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Admin can view all users (handled by application-level auth)
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (false); -- Will be handled by application-level auth

-- Policy: Admin can update users
CREATE POLICY "Admin can update users" ON users
  FOR UPDATE USING (false); -- Will be handled by application-level auth

-- Policy: Admin can delete users
CREATE POLICY "Admin can delete users" ON users
  FOR DELETE USING (false); -- Will be handled by application-level auth

-- Create RLS policies for admin_config table
CREATE POLICY "Admin only access" ON admin_config
  FOR ALL USING (false); -- Will be handled by application-level auth

-- Create RLS policies for events table
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage events" ON events
  FOR ALL USING (false); -- Will be handled by application-level auth

-- Create RLS policies for deals table
CREATE POLICY "Anyone can view active deals" ON deals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage deals" ON deals
  FOR ALL USING (false); -- Will be handled by application-level auth

-- Create RLS policies for local_info table
CREATE POLICY "Anyone can view active local info" ON local_info
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage local info" ON local_info
  FOR ALL USING (false); -- Will be handled by application-level auth

-- Create RLS policies for user_preferences table
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at 
    BEFORE UPDATE ON deals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_info_updated_at 
    BEFORE UPDATE ON local_info 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial admin configuration (password: Supaadmin@123)
-- Note: In production, this should be a hashed password
INSERT INTO admin_config (admin_password_hash) 
VALUES ('Supaadmin@123') 
ON CONFLICT DO NOTHING;

-- Create a view for user statistics (for admin dashboard)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) as new_users_this_month,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('week', CURRENT_DATE)) as new_users_this_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_last_7_days
FROM users;

-- Create a view for location statistics
CREATE OR REPLACE VIEW location_stats AS
SELECT 
    location,
    COUNT(*) as user_count
FROM users 
WHERE location IS NOT NULL 
GROUP BY location 
ORDER BY user_count DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert sample data for testing
INSERT INTO events (title, description, date, time, venue, address, price, category, source) VALUES
('Diwali Celebration 2024', 'Join us for a grand Diwali celebration with traditional food, music, and fireworks display.', '2024-11-01', '18:00:00', 'Community Center', '123 Main St, City, State 12345', 'Free', 'cultural', 'admin'),
('Holi Festival', 'Colorful Holi celebration with traditional music, dance, and delicious Indian food.', '2024-03-25', '10:00:00', 'City Park', '456 Park Ave, City, State 12345', '$10 per person', 'cultural', 'admin'),
('Indian Classical Music Concert', 'Evening of classical Indian music featuring renowned artists.', '2024-12-15', '19:30:00', 'Concert Hall', '789 Music St, City, State 12345', '$25 per person', 'cultural', 'admin');

INSERT INTO deals (title, description, category, price, original_price, discount, valid_until, business, link) VALUES
('20% Off Indian Groceries', 'Get 20% off on all Indian spices, lentils, and rice at Patel Brothers', 'food', '20% OFF', 'Regular Price', '20%', '2024-12-31', 'Patel Brothers', 'https://patelbros.com'),
('Free Delivery on Indian Food', 'Free delivery on orders over $25 from Spice Garden Restaurant', 'food', 'FREE', '$5.99', '100%', '2024-11-30', 'Spice Garden Restaurant', 'https://spicegarden.com'),
('India Travel Package Discount', 'Save $200 on round-trip flights to India with Desi Travel', 'travel', '$200 OFF', 'Regular Price', '$200', '2024-10-31', 'Desi Travel Agency', 'https://desitravel.com');

INSERT INTO local_info (type, name, description, phone, website, subtype) VALUES
('utility', 'Electric Company', 'Local electric utility provider', '(555) 123-4567', 'https://electriccompany.com', 'electric'),
('utility', 'Gas Company', 'Local gas utility provider', '(555) 234-5678', 'https://gascompany.com', 'gas'),
('utility', 'Water Department', 'Local water utility provider', '(555) 345-6789', 'https://waterdept.com', 'water'),
('emergency', 'Police (Emergency)', 'Emergency police services', '911', NULL, 'police'),
('emergency', 'Fire Department (Emergency)', 'Emergency fire services', '911', NULL, 'fire'),
('emergency', 'Police (Non-Emergency)', 'Non-emergency police services', '(555) 911-0000', NULL, 'non-emergency'),
('government', 'City Hall', 'Local government services, permits, and city information', NULL, 'https://cityhall.gov', NULL),
('government', 'DMV', 'Driver''s license, vehicle registration, and motor vehicle services', NULL, 'https://dmv.gov', NULL),
('trash_recycling', 'Trash Collection', 'Weekly trash collection service', NULL, NULL, 'trash'),
('trash_recycling', 'Recycling Collection', 'Weekly recycling collection service', NULL, NULL, 'recycling'),
('city_info', 'Your City', 'Population: 100,000 • Established: 1850 • Mayor: John Doe', NULL, 'https://yourcity.gov', NULL);

-- Success message
SELECT 'Desi Finder database setup completed successfully!' as message;
