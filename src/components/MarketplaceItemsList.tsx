import { Tag, MapPin, Phone, Calendar, ChevronRight } from 'lucide-react';
import type { Product, ProductCategory } from '../types';

interface MarketplaceItemsListProps {
  products: Product[];
  deals: Product[];
  category: ProductCategory;
  categoryName: string;
  categoryIcon: string;
  onViewAll?: (category: ProductCategory) => void;
}

const MarketplaceItemsList = ({ 
  products, 
  deals, 
  category, 
  categoryName,
  categoryIcon,
  onViewAll
}: MarketplaceItemsListProps) => {
  // Show only 2-3 items by default (prioritize deals)
  const defaultItemsCount = 3;
  const allItems = [...deals, ...products.filter(p => !deals.includes(p))];
  const displayItems = allItems.slice(0, defaultItemsCount);
  const hasMoreItems = allItems.length > defaultItemsCount;

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'text-green-600 bg-green-100';
      case 'used': return 'text-yellow-600 bg-yellow-100';
      case 'refurbished': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 sm:p-2 mb-2 sm:mb-3">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-primary-100 rounded flex items-center justify-center">
            <span className="text-xs">{categoryIcon}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{categoryName}</h3>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <p className="text-xs text-gray-500">
                {products.length} items
              </p>
              {deals.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Tag className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-600">
                    {deals.length} DEALS
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {hasMoreItems && onViewAll && (
          <button
            onClick={() => onViewAll(category)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 flex-shrink-0 touch-target px-2 py-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Items List - Compact Row Style */}
      <div className="space-y-0.5">
        {displayItems.map((product) => {
          const isDeal = product.deal_percentage && product.deal_percentage > 0;

          return (
            <div
              key={product.id}
              className={`p-1 sm:p-1.5 rounded border-l-2 transition-all duration-200 hover:bg-gray-50 ${
                isDeal
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {/* Product Title */}
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5">
                    <h4 className={`text-xs font-medium truncate ${
                      isDeal ? 'text-orange-900' : 'text-gray-900'
                    }`}>
                      {product.title}
                    </h4>
                    {isDeal && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-bold bg-orange-500 text-white flex-shrink-0">
                        {product.deal_percentage}%
                      </span>
                    )}
                  </div>

                  {/* Price and Condition */}
                  <div className="flex items-center space-x-1 sm:space-x-2 mb-0.5">
                    <div className="flex items-center space-x-1">
                      {isDeal && product.original_price ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-bold text-orange-600">
                            {formatPrice(product.price, product.currency)}
                          </span>
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.original_price, product.currency)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-gray-900">
                          {formatPrice(product.price, product.currency)}
                        </span>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-1 py-0.5 rounded text-xs font-medium ${getConditionColor(product.condition)} flex-shrink-0`}>
                      {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                    </span>
                  </div>

                  {/* Location and Contact - Responsive */}
                  <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-gray-500">
                    {product.location && (
                      <div className="flex items-center space-x-1 min-w-0">
                        <MapPin className="w-2 h-2 flex-shrink-0" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 min-w-0">
                      <Phone className="w-2 h-2 flex-shrink-0" />
                      <span className="truncate">{product.contact_info}</span>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Calendar className="w-2 h-2" />
                      <span className="hidden sm:inline">{new Date(product.created_at).toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(product.created_at).toLocaleDateString().split('/')[0]}/{new Date(product.created_at).toLocaleDateString().split('/')[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Button */}
                <div className="ml-1 sm:ml-2 flex-shrink-0">
                  <a
                    href={`tel:${product.contact_info}`}
                    className={`text-xs px-1.5 sm:px-2 py-1 rounded font-semibold transition-all duration-200 ${
                      isDeal
                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceItemsList;
