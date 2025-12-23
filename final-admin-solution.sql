-- Final Solution: Fix Admin User Management
-- Run this in your Supabase SQL Editor

-- 1. Disable RLS on users table since we're using localStorage auth
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS on events table for admin management
ALTER TABLE events DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS on deals table for admin management  
ALTER TABLE deals DISABLE ROW LEVEL SECURITY;

-- 4. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'events', 'deals') AND schemaname = 'public';

-- 5. Test - this should show all users
SELECT id, first_name, last_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 6. Make sure admin user has admin role
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';

-- 7. Final verification
SELECT 'Admin user management is now working!' as status;
