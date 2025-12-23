import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, ShoppingBag, X, XCircle, TrendingUp, MapPin } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { useMarketplaceItems } from '../hooks/useMarketplaceItems';
import { useAuth } from '../contexts/AuthContext';
import MarketplaceItemsCards from '../components/MarketplaceItemsCards';
import PlaceCard from '../components/PlaceCard';
import WeatherWidget from '../components/WeatherWidget';
import RadioWidget from '../components/RadioWidget';
import NewsWidget from '../components/NewsWidget';
import { SearchService } from '../services/searchService';
import { SearchSuggestionsService, type AutoSuggestion, type SearchSuggestion, type LocationCoordinates } from '../services/searchSuggestionsService';
import type { ProductCategory, Product, Business } from '../types';
import type { SearchResult } from '../services/searchService';

const Search = () => {
  const { location } = useLocationContext();
  const { user, isAuthenticated } = useAuth();
  const { products, loading: productsLoading, getProductsByCategory } = useMarketplaceItems();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [intelligentSearchMode, setIntelligentSearchMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedMarketplaceCategory] = useState<ProductCategory>('electronics');
  const [showMarketplaceCards, setShowMarketplaceCards] = useState(false);
  const [, setFilteredProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [, setIsTyping] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<AutoSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingSearches, setTrendingSearches] = useState<SearchSuggestion[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<LocationCoordinates | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Convert Location object to string for API calls
  const locationString = location ? (location.city || location.address || `${location.lat},${location.lng}`) : null;
  const userCoordinatesUndef = userCoordinates || undefined;

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

  // Get user coordinates
  useEffect(() => {
    const getUserCoordinates = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserCoordinates({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                radius_km: 10 // 10km radius by default
              });
            },
            (error) => {
              console.log('Geolocation error:', error);
              // Fallback to location-based searches
            }
          );
        }
      } catch (error) {
        console.error('Error getting user coordinates:', error);
      }
    };

    getUserCoordinates();
  }, []);

  // Load trending searches from database (radius-based or location-based)
  useEffect(() => {
    const loadTrendingSearches = async () => {
      try {
        const trending = await SearchSuggestionsService.getAllSearchesForLocation(
          locationString, 
          userCoordinatesUndef, 
          8
        );
        setTrendingSearches(trending);
      } catch (error) {
        console.error('Error loading trending searches:', error);
      }
    };
    
    loadTrendingSearches();
  }, [locationString, userCoordinates]);

  // Load auto-suggestions when user types (only during search, not from trending)
  useEffect(() => {
    const loadAutoSuggestions = async () => {
      if (searchQuery.trim().length >= 2 && !intelligentSearchMode) {
        try {
          const suggestions = await SearchSuggestionsService.getAutoSuggestions(
            searchQuery, 
            locationString, 
            5
          );
          
          setAutoSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error loading auto-suggestions:', error);
          // Fallback to pattern suggestions
          const patternSuggestions = SearchSuggestionsService.generatePatternSuggestions(searchQuery);
          setAutoSuggestions(patternSuggestions);
          setShowSuggestions(true);
        }
      } else {
        setAutoSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(loadAutoSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, location, intelligentSearchMode]);

  // Clear search results when query is empty
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      setIntelligentSearchMode(false);
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      setIsTyping(false);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const performIntelligentSearch = async () => {
    if (searchQuery.trim().length < 2) {
      setIntelligentSearchMode(false);
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    // Set loading state - prevent flickering by not clearing results immediately
    setIntelligentSearchMode(true);
    setSearchLoading(true);
    setSearchError(null);
    setShowSuggestions(false);
    
    try {
      // Save search query to database with coordinates
      await SearchSuggestionsService.saveSearchQuery(searchQuery, locationString, userCoordinatesUndef);
      
      // Wait for both marketplace and places searches to complete
      const results = await SearchService.intelligentSearch(
        searchQuery,
        location
      );
      
      // Only update UI once all results are ready - this prevents flickering
      setSearchResults(results);
      
      // Results are already set above
      
      // Refresh trending searches after successful search
      try {
        const trending = await SearchSuggestionsService.getAllSearchesForLocation(locationString, userCoordinatesUndef, 8);
        setTrendingSearches(trending);
      } catch (trendingError) {
        console.error('Error refreshing trending searches:', trendingError);
      }
      
      setSearchError(null);
    } catch (error) {
      console.error('Error performing intelligent search:', error);
      setSearchError('Failed to search. Please try again.');
      // Fallback to simple product search
      const fallbackProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      // Fallback products are shown in searchResults
      
      // Show fallback products as results
      setSearchResults(fallbackProducts.map(product => ({
        type: 'marketplace' as const,
        data: product,
        relevance: 1
      })));
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      SearchService.saveSearch(query);
    }
  };

  const handleTrendingClick = async (query: string) => {
    setSearchQuery(query);
    setIsSearchFocused(false);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
    
    // Save search query to database with coordinates
    await SearchSuggestionsService.saveSearchQuery(query, locationString, userCoordinatesUndef);
    
    // Refresh trending searches
    try {
      const trending = await SearchSuggestionsService.getAllSearchesForLocation(locationString, userCoordinatesUndef, 8);
      setTrendingSearches(trending);
    } catch (error) {
      console.error('Error refreshing trending searches:', error);
    }
    
    // Automatically trigger search when trending item is clicked
    if (query.trim().length >= 2) {
      performIntelligentSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsSearchFocused(false);
    searchInputRef.current?.blur();
    
    // Automatically trigger search when suggestion is clicked
    if (suggestion.trim().length >= 2) {
      performIntelligentSearch();
    }
  };

  // Unused function - kept for potential future use
  // const handleViewAllMarketplaceItems = (category: ProductCategory) => {
  //   setSelectedMarketplaceCategory(category);
  //   setShowMarketplaceCards(true);
  // };

  const handleCloseMarketplaceCards = () => {
    setShowMarketplaceCards(false);
  };

  const getUsername = () => {
    if (isAuthenticated && user) {
      return user.firstName || user.email?.split('@')[0] || 'User';
    }
    return 'Guest';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-24">
      {/* Mobile: pb-20 ensures content isn't hidden behind bottom navigation/footer */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 max-w-7xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back, {getUsername()}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Discover products, services, and local businesses in your community
          </p>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 relative">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search products, services, places, or anything..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
               onFocus={() => {
                 setIsSearchFocused(true);
                 if (searchQuery.trim().length >= 2 && !intelligentSearchMode) {
                   setShowSuggestions(true);
                 }
               }}
               onBlur={() => setTimeout(() => {
                 setIsSearchFocused(false);
                 setShowSuggestions(false);
               }, 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setIsSearchFocused(false);
                  setShowSuggestions(false);
                  searchInputRef.current?.blur();
                  
                  // Only search if query is meaningful (at least 2 characters)
                  if (searchQuery.trim().length >= 2) {
                    performIntelligentSearch();
                  }
                }
              }}
              className="w-full pl-4 pr-12 sm:pr-16 lg:pr-20 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base sm:text-base"
            />
            
            {searchQuery.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIntelligentSearchMode(false);
                  setSearchResults([]);
                }}
                className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
            
             <button
               onClick={() => {
                 setIsSearchFocused(false);
                 setShowSuggestions(false);
                 searchInputRef.current?.blur();
                 
                 // Only search if query is meaningful (at least 2 characters)
                 if (searchQuery.trim().length >= 2) {
                   performIntelligentSearch();
                 }
               }}
               className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 text-gray-500 hover:text-gray-600"
             >
                 <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
             </button>
        </div>

           {/* Auto-Suggestions Dropdown - Only during typing */}
           {showSuggestions && autoSuggestions.length > 0 && !intelligentSearchMode && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
               <div className="p-4">
                 <div className="flex items-center space-x-2 mb-3">
                   <SearchIcon className="w-4 h-4 text-blue-600" />
                   <h3 className="text-sm font-semibold text-gray-900">Suggestions</h3>
                 </div>
                 <div className="space-y-1">
                   {autoSuggestions.map((suggestion, index) => (
                     <button
                       key={index}
                       onClick={() => handleSuggestionClick(suggestion.query)}
                       className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between"
                     >
                       <span className="text-sm text-gray-700">{suggestion.query}</span>
                       {suggestion.count > 0 && (
                         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                           {suggestion.count}
                         </span>
                       )}
                     </button>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* Trending Searches Dropdown - Only when search is empty and focused */}
           {isSearchFocused && searchQuery.trim() === '' && trendingSearches.length > 0 && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
               <div className="p-4">
                 <div className="flex items-center space-x-2 mb-3">
                   <TrendingUp className="w-4 h-4 text-primary-600" />
                   <h3 className="text-sm font-semibold text-gray-900">Trending Searches</h3>
                   <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                     {userCoordinates ? `Within ${userCoordinates.radius_km}km` : (locationString || 'All Locations')}
                   </span>
                 </div>
                 <div className="space-y-2">
                   {trendingSearches.slice(0, 8).map((search, index) => (
                     <button
                       key={search.id || index}
                       onClick={() => handleTrendingClick(search.query)}
                       className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-between group"
                     >
                       <div className="flex items-center space-x-3">
                         <span className="text-xs font-semibold text-gray-400 w-6">
                           {index + 1}
                         </span>
                         <span className="text-sm text-gray-700 group-hover:text-primary-700">
                           {search.query}
                         </span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                           {search.count} searches
                         </span>
                         <span className="text-xs text-gray-400">
                           {new Date(search.updated_at).toLocaleDateString()}
                         </span>
                       </div>
                     </button>
                   ))}
                 </div>
                 {trendingSearches.length === 0 && (
                   <div className="text-center py-4">
                     <p className="text-sm text-gray-500">No trending searches yet</p>
                     <p className="text-xs text-gray-400 mt-1">Start searching to see trending topics</p>
                   </div>
                 )}
               </div>
             </div>
           )}
        </div>

        {/* Weather and Radio Widgets Row - Side by Side - Only show when not searching */}
        {!intelligentSearchMode && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <WeatherWidget />
            <RadioWidget />
          </div>
        )}

         {/* News Widget - Separate Row - Only show when not searching */}
         {!intelligentSearchMode && (
           <div className="mb-4 sm:mb-6">
             <NewsWidget />
           </div>
         )}


         {/* Loading State for Search */}
        {intelligentSearchMode && searchLoading && (
          <div className="text-center py-8 sm:py-12 mb-4 sm:mb-6">
            <div className="spinner mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base text-gray-600">Searching products and places...</p>
              </div>
            )}

        {/* Error State */}
        {intelligentSearchMode && searchError && !searchLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{searchError}</span>
            </div>
              </div>
            )}

        {/* Search Results - Filtered Marketplace Products and Places */}
        {intelligentSearchMode && !searchLoading && searchResults.length > 0 && (
          <div className="mb-6">
            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <SearchIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">
                  Found {searchResults.length} results for "{searchQuery}"
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                <span className="px-2 py-1 bg-blue-100 rounded">
                  🛍️ {searchResults.filter(r => r.type === 'marketplace').length} Products
                </span>
                <span className="px-2 py-1 bg-blue-100 rounded">
                  📍 {searchResults.filter(r => r.type === 'place').length} Places
                </span>
              </div>
            </div>

            {/* Filtered Results - Deals First, then Places */}
            <div className="space-y-6">
              {/* Deals Section - Show First */}
              {searchResults.filter(r => 
                r.type === 'marketplace' && 
                (r.data as Product).deal_percentage && 
                (r.data as Product)?.deal_percentage !== undefined && (r.data as Product).deal_percentage! > 0
              ).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <span className="text-xl">🔥</span>
                    <span>Special Deals</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults
                      .filter(r => r.type === 'marketplace' && (r.data as Product)?.deal_percentage !== undefined && (r.data as Product).deal_percentage! > 0)
                      .map((result) => {
                        const product = result.data as Product;
                        
                        return (
                          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            {/* Deal Badge */}
                            <div className="relative">
                              <div className="absolute top-2 right-2 z-10">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white bg-red-600">
                                  {product.deal_percentage}% OFF
                                </span>
                              </div>
                            </div>

                            {/* Product Content */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {product.title}
                                  </h3>
                                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Price */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-orange-600">
                                    {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: product.currency
                                    }).format(product.price)}
                                  </span>
                                  {product.original_price && (
                                    <span className="text-xs text-gray-500 line-through">
                                      {new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: product.currency
                                      }).format(product.original_price)}
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

                              {/* Contact Button */}
                              <a
                                href={`tel:${product.contact_info}`}
                                className="w-full text-center py-2 px-3 rounded-lg text-sm font-semibold transition-colors bg-orange-500 text-white hover:bg-orange-600"
                              >
                                Contact Seller
                              </a>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Regular Products */}
              {searchResults.filter(r => 
                r.type === 'marketplace' && 
                (!(r.data as Product)?.deal_percentage || (r.data as Product).deal_percentage! <= 0)
              ).length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-primary-600" />
                    <span>Products</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults
                      .filter(r => r.type === 'marketplace' && (!(r.data as Product)?.deal_percentage || (r.data as Product).deal_percentage! <= 0))
                      .map((result) => {
                        const product = result.data as Product;

                    return (
                          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                            {/* Product Content */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {product.title}
                        </h3>
                                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Price */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-col">
                                  <span className="text-lg font-bold text-primary-600">
                                    {new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: product.currency
                                    }).format(product.price)}
                                  </span>
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

                              {/* Contact Button */}
                              <a
                                href={`tel:${product.contact_info}`}
                                className="w-full text-center py-2 px-3 rounded-lg text-sm font-semibold transition-colors bg-primary-500 text-white hover:bg-primary-600"
                              >
                                Contact Seller
                              </a>
                            </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}

              {/* Local Places - Show Last */}
              {searchResults.filter(r => r.type === 'place').length > 0 && (
                <div className="mb-6">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    <span>Local Places</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {searchResults
                      .filter(r => r.type === 'place')
                      .map((result) => {
                        const business = result.data as Business;
                    return (
                            <PlaceCard key={business.id} business={business} />
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* No Results State */}
        {intelligentSearchMode && !searchLoading && searchResults.length === 0 && !searchError && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found for "{searchQuery}"
                </h3>
                <p className="text-gray-600">
              Try adjusting your search terms or browse by category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setIntelligentSearchMode(false);
                setSearchResults([]);
                setSearchLoading(false);
                setSearchError(null);
              }}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear search
            </button>
                          </div>
                        )}

                        
        {/* Loading State */}
        {productsLoading && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading marketplace items...</p>
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

export default Search;
