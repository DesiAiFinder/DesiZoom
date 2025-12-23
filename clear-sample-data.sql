-- Clear all sample/hardcoded data from the database
-- This will remove the hardcoded events, deals, and local info

-- Clear events table
DELETE FROM events WHERE source = 'admin' AND title IN (
  'Diwali Celebration 2024',
  'Holi Festival', 
  'Indian Classical Music Concert'
);

-- Clear deals table
DELETE FROM deals WHERE title IN (
  '20% Off Indian Groceries',
  'Free Delivery on Indian Food',
  'India Travel Package Discount'
);

-- Clear local_info table
DELETE FROM local_info WHERE name IN (
  'Electric Company',
  'Gas Company', 
  'Water Department',
  'Police (Emergency)',
  'Fire Department (Emergency)',
  'Police (Non-Emergency)',
  'City Hall',
  'DMV',
  'Trash Collection',
  'Recycling Collection',
  'Your City'
);

-- Success message
SELECT 'Sample data cleared successfully! Database is now ready for real API data.' as message;
