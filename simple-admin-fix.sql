-- Simple Fix: Allow Admin to See All Users
-- Run this in your Supabase SQL Editor

-- Option 1: Temporarily disable RLS for users table (RECOMMENDED FOR TESTING)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Check that it's disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Test query - this should now show all users
SELECT id, first_name, last_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- If you want to re-enable RLS later with proper policies, run:
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
