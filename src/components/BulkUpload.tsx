import { useState, useRef } from 'react';
import { Upload, Download, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ProductCategory } from '../types';

interface BulkUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedProduct {
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ProductCategory;
  condition: 'new' | 'used' | 'refurbished';
  location?: string;
  contact_info: string;
  deal_percentage?: number;
  original_price?: number;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  processed: number;
  errors: ValidationError[];
}

const BulkUpload = ({ onClose, onSuccess }: BulkUploadProps) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [parsedData, setParsedData] = useState<ParsedProduct[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const categories: ProductCategory[] = [
    'electronics', 'clothing', 'home_garden', 'vehicles', 'books', 
    'sports', 'beauty', 'food', 'services', 'other'
  ];

  const conditions: ('new' | 'used' | 'refurbished')[] = ['new', 'used', 'refurbished'];

  const validateProduct = (product: any, rowIndex: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    const row = rowIndex + 2; // +2 because CSV header is row 1, and arrays are 0-indexed

    // Required fields
    if (!product.title || product.title.trim() === '') {
      errors.push({ row, field: 'title', message: 'Title is required' });
    }

    if (!product.description || product.description.trim() === '') {
      errors.push({ row, field: 'description', message: 'Description is required' });
    }

    if (!product.price || isNaN(parseFloat(product.price))) {
      errors.push({ row, field: 'price', message: 'Valid price is required' });
    }

    if (!product.contact_info || product.contact_info.trim() === '') {
      errors.push({ row, field: 'contact_info', message: 'Contact info is required' });
    }

    // Category validation
    if (!product.category || !categories.includes(product.category)) {
      errors.push({ row, field: 'category', message: `Category must be one of: ${categories.join(', ')}` });
    }

    // Condition validation
    if (!product.condition || !conditions.includes(product.condition)) {
      errors.push({ row, field: 'condition', message: `Condition must be one of: ${conditions.join(', ')}` });
    }

    // Currency validation
    if (product.currency && !['USD', 'INR'].includes(product.currency)) {
      errors.push({ row, field: 'currency', message: 'Currency must be USD or INR' });
    }

    // Deal validation
    if (product.original_price && isNaN(parseFloat(product.original_price))) {
      errors.push({ row, field: 'original_price', message: 'Original price must be a valid number' });
    }

    if (product.deal_percentage && (isNaN(parseFloat(product.deal_percentage)) || parseFloat(product.deal_percentage) < 0 || parseFloat(product.deal_percentage) > 100)) {
      errors.push({ row, field: 'deal_percentage', message: 'Deal percentage must be between 0 and 100' });
    }

    return errors;
  };

  const parseCSV = (csvText: string): ParsedProduct[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['title', 'description', 'price', 'category', 'condition', 'contact_info'];
    
    // Check for required headers
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const products: ParsedProduct[] = [];
    const errors: ValidationError[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const product: any = {};

      headers.forEach((header, index) => {
        product[header] = values[index] || '';
      });

      // Convert numeric fields
      if (product.price) product.price = parseFloat(product.price);
      if (product.original_price) product.original_price = parseFloat(product.original_price);
      if (product.deal_percentage) product.deal_percentage = parseFloat(product.deal_percentage);

      // Set defaults
      product.currency = product.currency || 'USD';

      const rowErrors = validateProduct(product, i - 1);
      errors.push(...rowErrors);

      if (rowErrors.length === 0) {
        products.push(product as ParsedProduct);
      }
    }

    setValidationErrors(errors);
    return products;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);
    setValidationErrors([]);
    setParsedData([]);

    try {
      const text = await file.text();
      const products = parseCSV(text);
      setParsedData(products);
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to parse CSV file',
        processed: 0,
        errors: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) {
      alert('No valid products to upload');
      return;
    }

    if (!user?.id) {
      setUploadResult({
        success: false,
        message: 'You must be logged in to upload products',
        processed: 0,
        errors: []
      });
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Prepare products for insertion with proper data types
      const productsToInsert = parsedData.map(product => {
        const insertProduct: any = {
          title: product.title,
          description: product.description,
          price: parseFloat(product.price.toString()),
          currency: product.currency || 'USD',
          category: product.category,
          condition: product.condition,
          contact_info: product.contact_info,
          created_by: user.id,
          is_active: true
        };

        // Add optional fields only if they have values
        if (product.location && product.location.trim() !== '') {
          insertProduct.location = product.location;
        }

        if (product.original_price && product.original_price > 0) {
          insertProduct.original_price = parseFloat(product.original_price.toString());
        }

        if (product.deal_percentage && product.deal_percentage > 0) {
          insertProduct.deal_percentage = parseFloat(product.deal_percentage.toString());
        }

        return insertProduct;
      });

      console.log('Products to insert:', productsToInsert);
      console.log('User ID:', user.id);

      const { data, error } = await supabase
        .from('products')
        .insert(productsToInsert)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Insert successful:', data);

      setUploadResult({
        success: true,
        message: `Successfully uploaded ${parsedData.length} products`,
        processed: parsedData.length,
        errors: []
      });

      onSuccess();
    } catch (error) {
      console.error('Bulk upload error:', error);
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload products',
        processed: 0,
        errors: []
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'title',
      'description', 
      'price',
      'currency',
      'category',
      'condition',
      'location',
      'contact_info',
      'original_price',
      'deal_percentage'
    ];

    const sampleData = [
      'iPhone 13 Pro',
      'Brand new iPhone 13 Pro 128GB in Space Gray',
      '999.99',
      'USD',
      'electronics',
      'new',
      'Toronto, ON',
      '+1-416-555-0123',
      '1099.99',
      '9.1'
    ];

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'product_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Bulk Product Upload</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to use bulk upload:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Download the CSV template below</li>
              <li>Fill in your product data following the template format</li>
              <li>Upload your completed CSV file</li>
              <li>Review any validation errors and fix them if needed</li>
              <li>Click "Upload Products" to add them to the marketplace</li>
            </ol>
          </div>

          {/* Template Download */}
          <div className="mb-6">
            <button
              onClick={downloadTemplate}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {isUploading ? 'Processing file...' : 'Click to select CSV file or drag and drop'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="btn-primary"
              >
                {isUploading ? 'Processing...' : 'Select File'}
              </button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Validation Errors ({validationErrors.length})
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {validationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 mb-2">
                    <strong>Row {error.row}:</strong> {error.field} - {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Valid Products ({parsedData.length})
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                {parsedData.slice(0, 5).map((product, index) => (
                  <div key={index} className="text-sm text-green-700 mb-2 p-2 bg-white rounded border">
                    <strong>{product.title}</strong> - {product.category} - ${product.price}
                  </div>
                ))}
                {parsedData.length > 5 && (
                  <div className="text-sm text-green-600 italic">
                    ... and {parsedData.length - 5} more products
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className={`mb-6 p-4 rounded-lg border ${
              uploadResult.success 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                <span className="font-semibold">{uploadResult.message}</span>
              </div>
              {uploadResult.processed > 0 && (
                <p className="mt-1 text-sm">
                  Successfully processed {uploadResult.processed} products
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleBulkUpload}
              disabled={isUploading || parsedData.length === 0 || validationErrors.length > 0}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="spinner w-4 h-4" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload {parsedData.length} Products</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>

          {/* CSV Format Help */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">CSV Format Requirements:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Required fields:</strong> title, description, price, category, condition, contact_info</p>
              <p><strong>Optional fields:</strong> currency (USD/INR), location, original_price, deal_percentage</p>
              <p><strong>Categories:</strong> {categories.join(', ')}</p>
              <p><strong>Conditions:</strong> new, used, refurbished</p>
              <p><strong>Currencies:</strong> USD, INR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;
