# Bulk Product Upload Guide

The Desi Finder marketplace now supports bulk product uploads via CSV files. This feature allows you to upload multiple products at once, making it easier to manage large inventories.

## How to Use Bulk Upload

### 1. Access the Bulk Upload Feature
- Navigate to the Marketplace page
- Click the "Bulk Upload" button (next to "List Product")
- This will open the bulk upload modal

### 2. Download the CSV Template
- Click "Download CSV Template" to get a properly formatted CSV file
- The template includes sample data and all required headers

### 3. Prepare Your Data
Fill in your CSV file with the following columns:

#### Required Fields:
- **title**: Product name (e.g., "iPhone 13 Pro")
- **description**: Detailed product description
- **price**: Product price as a number (e.g., 999.99)
- **category**: One of: electronics, clothing, home_garden, vehicles, books, sports, beauty, food, services, other
- **condition**: One of: new, used, refurbished
- **contact_info**: Phone number or email for contact

#### Optional Fields:
- **currency**: USD or INR (defaults to USD)
- **location**: Product location (e.g., "Toronto, ON")
- **original_price**: Original price before discount (for deals)
- **deal_percentage**: Discount percentage (0-100)

### 4. Upload Your CSV
- Click "Select File" and choose your completed CSV file
- The system will validate your data and show any errors
- Review validation errors and fix them if needed
- Click "Upload Products" to add them to the marketplace

## CSV Format Example

```csv
title,description,price,currency,category,condition,location,contact_info,original_price,deal_percentage
iPhone 13 Pro,Brand new iPhone 13 Pro 128GB in Space Gray,999.99,USD,electronics,new,Toronto ON,+1-416-555-0123,1099.99,9.1
Samsung Galaxy S21,Used Samsung Galaxy S21 256GB,599.99,USD,electronics,used,Vancouver BC,+1-604-555-0123,,
```

## Validation Rules

### Required Fields
All products must have: title, description, price, category, condition, contact_info

### Category Options
- electronics
- clothing
- home_garden
- vehicles
- books
- sports
- beauty
- food
- services
- other

### Condition Options
- new
- used
- refurbished

### Currency Options
- USD
- INR

### Price Validation
- Must be a valid number
- Original price must be higher than current price for deals
- Deal percentage must be between 0 and 100

## Error Handling

The system will show validation errors for:
- Missing required fields
- Invalid category or condition values
- Invalid price formats
- Invalid currency codes
- Deal percentage out of range

Fix these errors in your CSV file and re-upload.

## Tips for Success

1. **Use the template**: Always start with the provided CSV template
2. **Check your data**: Review the validation errors carefully
3. **Test with small batches**: Upload a few products first to test your format
4. **Keep backups**: Save your CSV files for future reference
5. **Use consistent formatting**: Ensure all data follows the same format

## Troubleshooting

### Common Issues:
- **"Missing required headers"**: Make sure your CSV has the correct column names
- **"Invalid category"**: Use only the allowed category values
- **"Price must be a valid number"**: Ensure price fields contain only numbers
- **"Contact info is required"**: Every product needs contact information

### File Format Issues:
- Make sure your file is saved as .csv
- Use commas to separate columns
- Don't use quotes unless necessary
- Keep descriptions on single lines (avoid line breaks)

## Support

If you encounter issues with bulk upload:
1. Check the validation errors shown in the interface
2. Verify your CSV format matches the template
3. Ensure all required fields are filled
4. Contact support if problems persist
