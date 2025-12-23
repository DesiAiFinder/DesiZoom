-- Fix bulk upload database issues
-- Run this in your Supabase SQL Editor to ensure all required columns exist

-- First, ensure the products table exists with all required columns
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new', 'used', 'refurbished')),
  location TEXT,
  contact_info TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add deal columns if they don't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_percentage DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) DEFAULT NULL;

-- Disable RLS for products table (since we're using localStorage auth)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_deal_percentage ON products(deal_percentage) WHERE deal_percentage IS NOT NULL;

-- Add comments to document the columns
COMMENT ON TABLE products IS 'Marketplace products that users can sell';
COMMENT ON COLUMN products.condition IS 'Product condition: new, used, or refurbished';
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product';
COMMENT ON COLUMN products.created_by IS 'User who created this product listing';
COMMENT ON COLUMN products.deal_percentage IS 'Percentage discount (e.g., 20.00 for 20% off)';
COMMENT ON COLUMN products.original_price IS 'Original price before discount';

-- Ensure users table exists for foreign key reference
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'service_provider', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Database setup completed successfully! All required columns for bulk upload are now available.' as message;
