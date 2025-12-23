-- Desi Finder Role-Based System Update (Final Version)
-- This script handles ALL existing policies and creates the role-based system

-- Step 1: Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'service_provider' 
CHECK (role IN ('admin', 'service_provider'));

-- Step 2: Add created_by columns to events and deals tables
ALTER TABLE events ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Step 3: Update existing events and deals to have created_by as NULL (admin created)
UPDATE events SET created_by = NULL WHERE created_by IS NULL;
UPDATE deals SET created_by = NULL WHERE created_by IS NULL;

-- Step 4: Create a service provider dashboard view
CREATE OR REPLACE VIEW service_provider_stats AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT e.id) as events_created,
    COUNT(DISTINCT d.id) as deals_created,
    u.created_at as member_since
FROM users u
LEFT JOIN events e ON u.id = e.created_by
LEFT JOIN deals d ON u.id = d.created_by
WHERE u.role = 'service_provider'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at;

-- Step 5: Drop ALL existing policies on users table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', pol.policyname);
    END LOOP;
END $$;

-- Step 6: Drop ALL existing policies on events table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'events' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON events', pol.policyname);
    END LOOP;
END $$;

-- Step 7: Drop ALL existing policies on deals table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'deals' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON deals', pol.policyname);
    END LOOP;
END $$;

-- Step 8: Create new role-based policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR role = 'admin');

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (role = 'admin');

CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (role = 'admin');

CREATE POLICY "Anyone can register" ON users
  FOR INSERT WITH CHECK (true);

-- Step 9: Create new role-based policies for events table
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service providers can create events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text OR created_by IS NULL);

CREATE POLICY "Users can edit own events" ON events
  FOR UPDATE USING (auth.uid()::text = created_by::text OR created_by IS NULL);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (auth.uid()::text = created_by::text OR created_by IS NULL);

-- Step 10: Create new role-based policies for deals table
CREATE POLICY "Anyone can view active deals" ON deals
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service providers can create deals" ON deals
  FOR INSERT WITH CHECK (auth.uid()::text = created_by::text OR created_by IS NULL);

CREATE POLICY "Users can edit own deals" ON deals
  FOR UPDATE USING (auth.uid()::text = created_by::text OR created_by IS NULL);

CREATE POLICY "Users can delete own deals" ON deals
  FOR DELETE USING (auth.uid()::text = created_by::text OR created_by IS NULL);

-- Step 11: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_deals_created_by ON deals(created_by);

-- Step 12: Set admin user role
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';

-- Step 13: Add comments to document the changes
COMMENT ON COLUMN users.role IS 'User role: admin or service_provider';
COMMENT ON COLUMN events.created_by IS 'User who created this event (NULL for admin-created events)';
COMMENT ON COLUMN deals.created_by IS 'User who created this deal (NULL for admin-created deals)';

-- Step 14: Success message
SELECT 'Role-based system successfully updated! All existing policies removed and new ones created.' as message;
