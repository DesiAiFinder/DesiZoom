import { useState } from 'react';
import { X, MapPin, Phone, Calendar, ShoppingBag } from 'lucide-react';
import type { Product, ProductCategory } from '../types';

interface MarketplaceItemsCardsProps {
  products: Product[];
  category: ProductCategory;
  categoryName: string;
  categoryIcon: string;
  onClose: () => void;
}

const MarketplaceItemsCards = ({
  products,
  categoryName,
  categoryIcon,
  onClose
}: MarketplaceItemsCardsProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'used' | 'refurbished'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 items per page

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCondition = conditionFilter === 'all' || product.condition === conditionFilter;
    return matchesSearch && matchesCondition;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleConditionChange = (value: 'all' | 'new' | 'used' | 'refurbished') => {
    setConditionFilter(value);
    setCurrentPage(1);
  };

  // Calculate pagination display values
  const paginationStart = startIndex + 1;
  const paginationEnd = Math.min(endIndex, filteredProducts.length);
  
  // Calculate pagination button values
  const maxPageButtons = Math.min(5, totalPages);
  const pageButtonStart = Math.max(1, Math.min(totalPages - 4, currentPage - 2));

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      electronics: 'bg-blue-500',
      clothing: 'bg-pink-500',
      home_garden: 'bg-green-500',
      vehicles: 'bg-gray-500',
      books: 'bg-purple-500',
      sports: 'bg-orange-500',
      beauty: 'bg-red-500',
      food: 'bg-indigo-500',
      services: 'bg-teal-500',
      other: 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryName = (category: string) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{categoryIcon}</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{categoryName}</h2>
                <p className="text-sm text-gray-500">
                  {filteredProducts.length} items available
                  {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <select
                value={conditionFilter}
                onChange={(e) => handleConditionChange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => {
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                      {/* Product Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-3 h-3 ${getCategoryColor(product.category)} rounded-full mt-1`}></div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {getCategoryName(product.category)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            {product.deal_percentage && product.original_price ? (
                              <>
                                <span className="text-2xl font-bold text-primary-600">
                                  {formatPrice(product.price, product.currency)}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    {formatPrice(product.original_price, product.currency)}
                                  </span>
                                  <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                    {product.deal_percentage}% OFF
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-primary-600">
                                {formatPrice(product.price, product.currency)}
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.condition === 'new'
                              ? 'bg-green-100 text-green-800'
                              : product.condition === 'used'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {product.description}
                        </p>

                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          {product.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {product.location}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {product.contact_info}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Listed {new Date(product.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex space-x-2">
                          <a
                            href={`tel:${product.contact_info}`}
                            className="flex-1 btn-primary text-center text-sm py-2"
                          >
                            Contact Seller
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing {paginationStart} to {paginationEnd} of {filteredProducts.length} items
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: maxPageButtons }, (_, i) => {
                        const pageNum = pageButtonStart + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              currentPage === pageNum
                                ? 'bg-primary-500 text-white border-primary-500'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItemsCards;