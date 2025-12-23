-- Marketplace Products Table Setup
-- Run this in your Supabase SQL Editor

-- Create products table
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

-- Disable RLS for products table (since we're using localStorage auth)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Add comments to document the table
COMMENT ON TABLE products IS 'Marketplace products that service providers can sell';
COMMENT ON COLUMN products.condition IS 'Product condition: new, used, or refurbished';
COMMENT ON COLUMN products.images IS 'Array of image URLs for the product';
COMMENT ON COLUMN products.created_by IS 'User who created this product listing';

-- Create a view for product statistics
CREATE OR REPLACE VIEW product_stats AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.email,
    COUNT(DISTINCT p.id) as products_listed,
    COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) as active_products,
    u.created_at as member_since
FROM users u
LEFT JOIN products p ON u.id = p.created_by
WHERE u.role = 'service_provider'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.created_at;

-- Success message
SELECT 'Marketplace products table created successfully!' as message;
