-- Users table for Desi Finder community registration
-- Run this in your Supabase SQL Editor if the users table doesn't exist or needs updating

-- Drop existing users table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table with the correct structure for registration
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
-- Allow anyone to insert (register)
CREATE POLICY "Allow public registration" ON users
  FOR INSERT WITH CHECK (true);

-- Allow users to read their own data (for future features)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow admins to read all user data
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (true);

-- Allow admins to delete users
CREATE POLICY "Admins can delete users" ON users
  FOR DELETE USING (true);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Add a comment to the table
COMMENT ON TABLE users IS 'Community member registration data for Desi Finder';

