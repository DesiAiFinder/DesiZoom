# Debug Bulk Upload Issues

## Common Issues and Solutions

### 1. Database Schema Issues
**Problem**: Missing columns in the products table
**Solution**: Run the `fix-bulk-upload-database.sql` script in your Supabase SQL Editor

### 2. Authentication Issues
**Problem**: User not properly authenticated
**Check**: 
- Open browser console (F12)
- Look for "User ID:" in the console logs
- Ensure you're logged in before trying bulk upload

### 3. Data Type Issues
**Problem**: Invalid data types being inserted
**Check**:
- Price must be a valid number
- Deal percentage must be between 0-100
- Category must match allowed values
- Condition must be: new, used, or refurbished

### 4. CSV Format Issues
**Problem**: Malformed CSV data
**Check**:
- Ensure CSV has proper headers
- No empty required fields
- Proper comma separation
- No special characters in data

## Debug Steps

### Step 1: Check Database Schema
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run this query to check table structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
```

### Step 2: Test Single Product Insert
1. Go to Marketplace
2. Try adding a single product manually
3. If that works, the issue is with bulk upload logic
4. If that fails, the issue is with database setup

### Step 3: Check Console Logs
1. Open browser console (F12)
2. Try bulk upload
3. Look for error messages in console
4. Check for "Products to insert:" and "User ID:" logs

### Step 4: Verify CSV Data
1. Download the template
2. Add just one product with minimal data
3. Try uploading that single product
4. If it works, add more products gradually

## Expected Console Output
When working correctly, you should see:
```
Products to insert: [array of product objects]
User ID: [user-id-string]
Insert successful: [array of inserted records]
```

## Common Error Messages

### "You must be logged in to upload products"
- **Cause**: User not authenticated
- **Fix**: Log in before trying bulk upload

### "Database error: column 'deal_percentage' does not exist"
- **Cause**: Missing database columns
- **Fix**: Run the `fix-bulk-upload-database.sql` script

### "Invalid input syntax for type decimal"
- **Cause**: Invalid price or percentage values
- **Fix**: Ensure all numeric fields contain valid numbers

### "Value too long for type character varying"
- **Cause**: Text fields too long
- **Fix**: Shorten title, description, or other text fields

## Test with Minimal Data
Try this minimal CSV first:
```csv
title,description,price,currency,category,condition,contact_info
Test Product,Test description,99.99,USD,electronics,new,test@example.com
```

If this works, gradually add more fields and products.
