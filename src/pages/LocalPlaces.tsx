import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, XCircle } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { usePlacesSearch } from '../hooks/usePlacesSearch';
import PlaceCard from '../components/PlaceCard';
import type { BusinessCategory, SearchFilters } from '../types';

const LocalPlaces = () => {
  const [searchParams] = useSearchParams();
  const { location, loading: locationLoading } = useLocationContext();
  const { businesses, loading: searchLoading, error, searchBusinesses, clearResults } = usePlacesSearch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>('restaurant');
  const [filters, setFilters] = useState<SearchFilters>({
    radius: 10,
    rating: 0,
    priceLevel: undefined,
    openNow: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [, setImageLoadStartTimes] = useState<Record<string, number>>({});
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const categories: { id: BusinessCategory; name: string; icon: string }[] = [
    { id: 'restaurant', name: 'Restaurants', icon: '🍽️' },
    { id: 'grocery', name: 'Grocery Stores', icon: '🛒' },
    { id: 'temple', name: 'Temples', icon: '🕉️' },
    { id: 'travel', name: 'Travel Agents', icon: '✈️' },
    { id: 'services', name: 'Services', icon: '🔧' },
    { id: 'other', name: 'Other', icon: '📍' }
  ];

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category') as BusinessCategory;
    if (category && categories.some(c => c.id === category)) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Close filters dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Search when location is available
  useEffect(() => {
    if (location && !locationLoading && searchQuery.length === 0) {
      handleSearch();
    }
  }, [location, selectedCategory, filters]);

  // Initialize loading states for new businesses
  useEffect(() => {
    if (businesses.length > 0) {
      const newLoadingStates: Record<string, boolean> = {};
      const newLoadStartTimes: Record<string, number> = {};
      const currentTime = Date.now();
      
      businesses.forEach(business => {
        if (business.photos && business.photos.length > 0) {
          newLoadingStates[business.id] = true;
          newLoadStartTimes[business.id] = currentTime;
          
          setTimeout(() => {
            setImageLoadingStates(prev => {
              if (prev[business.id] === true) {
                return { ...prev, [business.id]: false };
              }
              return prev;
            });
          }, 10000);
        }
      });
      setImageLoadingStates(newLoadingStates);
      setImageLoadStartTimes(newLoadStartTimes);
    }
  }, [businesses]);

  const handleSearch = async () => {
    if (!location) return;
    
    clearResults();
    await searchBusinesses(location, selectedCategory, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearchWithQuery = async () => {
    if (!location) return;
    
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length >= 3) {
      clearResults();
      await searchBusinesses(location, selectedCategory, filters, trimmedQuery);
    }
  };

  const clearFilters = () => {
    setFilters({
      radius: 10,
      rating: 0,
      priceLevel: undefined,
      openNow: false
    });
  };

  // Unused functions - kept for potential future use
  // const getPriceLevelText = (level?: number) => {
  //   if (level === undefined) return 'Any';
  //   return '$'.repeat(level);
  // };

  // const handleImageLoad = (businessId: string) => {
  //   const startTime = imageLoadStartTimes[businessId] || Date.now();
  //   const elapsedTime = Date.now() - startTime;
  //   const minDisplayTime = 1000;
  //   
  //   if (elapsedTime < minDisplayTime) {
  //     setTimeout(() => {
  //       setImageLoadingStates(prev => ({ ...prev, [businessId]: false }));
  //     }, minDisplayTime - elapsedTime);
  //   } else {
  //     setImageLoadingStates(prev => ({ ...prev, [businessId]: false }));
  //   }
  // };

  // const handleImageError = (businessId: string) => {
  //   const startTime = imageLoadStartTimes[businessId] || Date.now();
  //   const elapsedTime = Date.now() - startTime;
  //   const minDisplayTime = 1000;
  //   
  //   if (elapsedTime < minDisplayTime) {
  //     setTimeout(() => {
  //       setImageLoadingStates(prev => ({ ...prev, [businessId]: false }));
  //     }, minDisplayTime - elapsedTime);
  //   } else {
  //     setImageLoadingStates(prev => ({ ...prev, [businessId]: false }));
  //   }
  // };

  // const handleImageStart = (businessId: string) => {
  //   setImageLoadingStates(prev => ({ ...prev, [businessId]: true }));
  //   setImageLoadStartTimes(prev => ({ ...prev, [businessId]: Date.now() }));
  // };

  const handleShowPlacesForCategory = async (category: BusinessCategory) => {
    setSelectedCategory(category);
    
    if (location) {
      clearResults();
      await searchBusinesses(location, category, filters);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Local Places
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Discover Indian businesses and services in your area
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for specific businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchWithQuery();
                }
              }}
              className="w-full pl-4 pr-16 sm:pr-20 py-3 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            />
            
            {searchQuery.length > 0 && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-12 sm:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
            
            <button
              onClick={handleSearchWithQuery}
              disabled={!location || searchLoading}
              className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                !location || searchLoading
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              {searchLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Category Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            What are you looking for?
          </h3>
          
          {/* Mobile: Horizontal Scrollable Categories */}
          <div className="block sm:hidden">
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleShowPlacesForCategory(category.id)}
                  className={`flex-shrink-0 p-3 rounded-lg border-2 transition-colors duration-200 min-w-[80px] ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div className="text-xs font-medium text-center leading-tight">{category.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Tablet and Desktop: Grid Layout */}
          <div className="hidden sm:block">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleShowPlacesForCategory(category.id)}
                  className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                    selectedCategory === category.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Dropdown */}
          <div className="relative mt-4" ref={filtersRef}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm sm:text-base">Filters</span>
              <span className="text-xs text-gray-500 hidden sm:inline">({filters.radius}mi, {filters.rating && filters.rating > 0 ? filters.rating + '+ stars' : 'Any rating'})</span>
            </button>
            
            {/* Filters Dropdown Panel */}
            {showFilters && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Search Filters</h3>
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Radius Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
                    <select
                      value={filters.radius}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={5}>5 miles</option>
                      <option value={10}>10 miles</option>
                      <option value={15}>15 miles</option>
                      <option value={25}>25 miles</option>
                      <option value={50}>50 miles</option>
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={0}>Any rating</option>
                      <option value={3}>3+ stars</option>
                      <option value={4}>4+ stars</option>
                      <option value={4.5}>4.5+ stars</option>
                    </select>
                  </div>
                  
                  {/* Price Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Level</label>
                    <select
                      value={filters.priceLevel || ''}
                      onChange={(e) => handleFilterChange('priceLevel', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Any price</option>
                      <option value={1}>$ (Budget)</option>
                      <option value={2}>$$ (Moderate)</option>
                      <option value={3}>$$$ (Expensive)</option>
                      <option value={4}>$$$$ (Very Expensive)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Places Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {searchLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600 animate-pulse">Searching for {categories.find(f => f.id === selectedCategory)?.name || 'businesses'}...</p>
          </div>
        )}

        {!searchLoading && businesses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Found {businesses.length} {categories.find(f => f.id === selectedCategory)?.name || 'businesses'}
            </h2>
          </div>
        )}

        {!searchLoading && businesses.length === 0 && !error && location && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {categories.find(f => f.id === selectedCategory)?.name || 'businesses'} found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or expanding your search radius.
            </p>
          </div>
        )}

        {/* Business Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {businesses.filter(business => business.businessStatus !== 'CLOSED_TEMPORARILY').map((business) => (
            <PlaceCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocalPlaces;

