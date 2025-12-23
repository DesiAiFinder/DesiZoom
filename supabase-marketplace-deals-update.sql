-- Add deals field to products table
-- Run this in your Supabase SQL Editor

-- Add deals column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS deal_percentage DECIMAL(5,2) DEFAULT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2) DEFAULT NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN products.deal_percentage IS 'Percentage discount (e.g., 20.00 for 20% off)';
COMMENT ON COLUMN products.original_price IS 'Original price before discount';

-- Create index for better performance when filtering deals
CREATE INDEX IF NOT EXISTS idx_products_deal_percentage ON products(deal_percentage) WHERE deal_percentage IS NOT NULL;

-- Success message
SELECT 'Deals field added to products table successfully!' as message;
