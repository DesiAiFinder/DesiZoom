-- Fix Admin Role and Check Users
-- Run this in your Supabase SQL Editor

-- 1. Check all users and their roles
SELECT id, first_name, last_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;

-- 2. Set admin role for admin@test.com (if it exists)
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@test.com';

-- 3. Check if the update worked
SELECT id, first_name, last_name, email, role, created_at 
FROM users 
WHERE email = 'admin@test.com';

-- 4. If admin@test.com doesn't exist, create it
INSERT INTO users (first_name, last_name, email, role, created_at)
VALUES ('Admin', 'User', 'admin@test.com', 'admin', NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 5. Final check - show all users
SELECT id, first_name, last_name, email, role, created_at 
FROM users 
ORDER BY created_at DESC;
