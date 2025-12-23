import { useState, useEffect } from 'react';
import { 
  Gift, 
  ShoppingBag, 
  Search as SearchIcon, 
  MapPin, 
  Phone, 
  Calendar as CalendarIcon,
  ExternalLink,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import MarketplaceItemsList from '../components/MarketplaceItemsList';
import MarketplaceItemsCards from '../components/MarketplaceItemsCards';
import type { Product, ProductCategory } from '../types';

const Deals = () => {
  const { } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState<ProductCategory>('electronics');
  const [showMarketplaceCards, setShowMarketplaceCards] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'categories'>('categories');

  const categories = [
    { id: 'all', name: 'All Categories', color: 'bg-gray-500' },
    { id: 'electronics', name: 'Electronics', color: 'bg-blue-500' },
    { id: 'clothing', name: 'Clothing', color: 'bg-purple-500' },
    { id: 'home_garden', name: 'Home & Garden', color: 'bg-green-500' },
    { id: 'vehicles', name: 'Vehicles', color: 'bg-red-500' },
    { id: 'books', name: 'Books', color: 'bg-yellow-500' },
    { id: 'sports', name: 'Sports', color: 'bg-orange-500' },
    { id: 'beauty', name: 'Beauty', color: 'bg-pink-500' },
    { id: 'food', name: 'Food', color: 'bg-indigo-500' },
    { id: 'services', name: 'Services', color: 'bg-teal-500' },
    { id: 'other', name: 'Other', color: 'bg-gray-500' }
  ];

  const marketplaceCategories: { id: ProductCategory; name: string; icon: string }[] = [
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'clothing', name: 'Clothing', icon: '👗' },
    { id: 'home_garden', name: 'Home & Garden', icon: '🏠' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
    { id: 'books', name: 'Books', icon: '📚' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'food', name: 'Food', icon: '🍚' },
    { id: 'services', name: 'Services', icon: '🔧' },
    { id: 'other', name: 'Other', icon: '📦' }
  ];

  useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      // Only load products that have deals (deal_percentage is not null)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .not('deal_percentage', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    let filteredProducts = products;

    // Apply search filter
    if (searchQuery.trim()) {
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
    }

    return filteredProducts;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.color || 'bg-gray-500';
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat?.name || 'Other';
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price);
  };

  const calculateSavings = (originalPrice: number, dealPrice: number) => {
    return originalPrice - dealPrice;
  };

  const handleViewAllMarketplaceItems = (category: ProductCategory) => {
    setSelectedMarketplaceCategory(category);
    setShowMarketplaceCards(true);
  };

  const handleCloseMarketplaceCards = () => {
    setShowMarketplaceCards(false);
  };

  const getProductsByCategory = (category: ProductCategory) => {
    return products.filter(product => product.category === category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Hot Deals 🔥
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('categories')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'categories'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-1 inline" />
                Categories
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Gift className="w-4 h-4 mr-1 inline" />
                Grid
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Discover amazing deals on products from our community sellers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="input"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deals Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hot deals...</p>
          </div>
        ) : getFilteredProducts().length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No deals found
            </h3>
            <p className="text-gray-600">
              {searchQuery || categoryFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'No deals are currently available. Check back later for amazing offers!'}
            </p>
          </div>
        ) : viewMode === 'categories' ? (
          /* Category-wise Deals View */
          <div className="space-y-6">
            {marketplaceCategories.map((category) => {
              const categoryProducts = getFilteredProducts().filter(p => p.category === category.id);
              const categoryDeals = categoryProducts.filter(p => p.deal_percentage && p.deal_percentage > 0);
              
              if (categoryProducts.length === 0) return null;

              return (
                <MarketplaceItemsList
                  key={category.id}
                  products={categoryProducts}
                  deals={categoryDeals}
                  category={category.id}
                  categoryName={category.name}
                  categoryIcon={category.icon}
                  onViewAll={handleViewAllMarketplaceItems}
                />
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredProducts().map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Deal Badge */}
                <div className="relative">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white bg-red-600 shadow-lg">
                      <Gift className="w-4 h-4 mr-1" />
                      {product.deal_percentage}% OFF
                    </span>
                  </div>
                </div>

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
                  
                  {/* Price Display */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      {product.original_price && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price, product.currency)}
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                            Save {formatPrice(calculateSavings(product.original_price, product.price), product.currency)}
                          </span>
                        </div>
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
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Listed {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <a
                      href={`tel:${product.contact_info}`}
                      className="flex-1 btn-primary text-center text-sm py-2"
                    >
                      Contact Seller
                    </a>
                    <a
                      href="/marketplace"
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {!loading && getFilteredProducts().length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Want to list your own deals?
              </h3>
              <p className="text-gray-600 mb-4">
                Join our marketplace and start selling your products with special deals
              </p>
              <a
                href="/marketplace"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Go to Marketplace</span>
              </a>
            </div>
          </div>
        )}

        {/* Marketplace Items Cards Modal */}
        {showMarketplaceCards && (
          <MarketplaceItemsCards
            products={getProductsByCategory(selectedMarketplaceCategory)}
            category={selectedMarketplaceCategory}
            categoryName={marketplaceCategories.find(c => c.id === selectedMarketplaceCategory)?.name || 'Products'}
            categoryIcon={marketplaceCategories.find(c => c.id === selectedMarketplaceCategory)?.icon || '📦'}
            onClose={handleCloseMarketplaceCards}
          />
        )}
      </div>
    </div>
  );
};

export default Deals;