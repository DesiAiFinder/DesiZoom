import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radio, 
  Search,
  Heart,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { radioBrowserService, RadioStation } from '../services/radioBrowserService';

const RadioPage: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [likedStations, setLikedStations] = useState<string[]>([]);

  // Load liked stations from localStorage
  useEffect(() => {
    const loadLikedStations = () => {
      try {
        const stored = localStorage.getItem('radio-liked-stations');
        if (stored) {
          setLikedStations(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading liked stations:', error);
      }
    };
    loadLikedStations();
  }, []);

  // Subscribe to radio service for current station updates
  useEffect(() => {
    const unsubscribe = radioBrowserService.subscribe((state) => {
      setCurrentStation(state.currentStation);
      setLikedStations(state.likedStations);
      setIsLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  // Detect user location and load stations on component mount
  useEffect(() => {
    const initializeRadio = async () => {
      setIsLoadingStations(true);
      try {
        // Detect user country and load stations
        await radioBrowserService.detectUserCountry();
        const loadedStations = await radioBrowserService.fetchStationsByCountry(radioBrowserService.getCountryCode());
        setStations(loadedStations);
      } catch (error) {
        console.error('Error initializing radio:', error);
        // Fallback to India
        const fallbackStations = await radioBrowserService.fetchStationsByCountry('IN');
        setStations(fallbackStations);
      } finally {
        setIsLoadingStations(false);
      }
    };

    initializeRadio();
  }, []);

  // Play station function
  const playStation = async (station: RadioStation) => {
    await radioBrowserService.playStation(station);
  };

  // Toggle like station function
  const toggleLikeStation = (stationId: string) => {
    radioBrowserService.toggleLikeStation(stationId);
  };

  // Check if station is liked
  const isStationLiked = (stationId: string) => {
    return likedStations.includes(stationId);
  };

  // Filter stations based on search and filters
  const filteredStations = useMemo(() => {
    return stations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           station.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           station.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (station.tags && station.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesGenre = selectedGenre === 'All' || station.genre === selectedGenre;
      const matchesLanguage = selectedLanguage === 'All' || station.language === selectedLanguage;

      return matchesSearch && matchesGenre && matchesLanguage;
    });
  }, [stations, searchQuery, selectedGenre, selectedLanguage]);

  // Get unique genres and languages for filters
  const genres = useMemo(() => {
    const uniqueGenres = [...new Set(stations.map(station => station.genre))];
    return ['All', ...uniqueGenres.sort()];
  }, [stations]);

  const languages = useMemo(() => {
    const uniqueLanguages = [...new Set(stations.map(station => station.language))];
    return ['All', ...uniqueLanguages.sort()];
  }, [stations]);

  const refreshStations = async () => {
    setIsLoadingStations(true);
    try {
      const refreshedStations = await radioBrowserService.fetchStationsByCountry(radioBrowserService.getCountryCode());
      setStations(refreshedStations);
    } catch (error) {
      console.error('Failed to refresh stations:', error);
    } finally {
      setIsLoadingStations(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <Radio className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-green-600 bg-clip-text text-transparent mb-2">
            Desi Radio
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Listen to radio stations from around the world powered by Radio Browser
          </p>
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <strong>Note:</strong> Stations are loaded based on your current location. Some stations may be temporarily unavailable.
          </div> */}
        </div>


        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search radio stations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="lg:w-48">
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="All">All Genres</option>
                {genres.slice(1).map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="lg:w-48">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="All">All Languages</option>
                {languages.slice(1).map(language => (
                  <option key={language} value={language}>{language}</option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="lg:w-auto">
              <button
                onClick={refreshStations}
                disabled={isLoadingStations}
                className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoadingStations ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5" />
                )}
              </button>
            </div>
                      </div>
                    </div>


        {/* Loading State */}
        {isLoadingStations && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Loading stations...</h3>
            <p className="text-gray-400">Fetching radio stations for your location</p>
          </div>
        )}

        {/* Radio Stations Grid */}
        {!isLoadingStations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map((station) => (
              <div
                key={station.id}
                className={`radio-station-card ${
                  currentStation?.id === station.id ? 'active' : ''
                }`}
                onClick={() => playStation(station)}
              >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        {station.logo ? (
                          <img 
                            src={station.logo} 
                            alt={station.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Radio className={`w-6 h-6 text-white ${station.logo ? 'hidden' : ''}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-800 truncate">{station.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{station.country}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {currentStation?.id === station.id && isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                    )}
                    {currentStation?.id === station.id && isLoading && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-shrink-0">{station.description}</p>

                <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                      {station.genre}
                  </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {station.language}
                  </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {station.country}
                    </span>
                    {station.bitrate && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {station.bitrate}kbps
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeStation(station.id);
                      }}
                      className={`flex items-center text-sm transition-colors ${
                        isStationLiked(station.id)
                          ? 'text-red-500'
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${isStationLiked(station.id) ? 'fill-current' : ''}`} />
                      {isStationLiked(station.id) ? 'Liked' : 'Like'}
                  </button>
                  
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playStation(station);
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentStation?.id === station.id && isLoading
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                        }`}
                      >
                        {currentStation?.id === station.id && isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Play'
                        )}
                      </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* No Results */}
        {!isLoadingStations && filteredStations.length === 0 && (
          <div className="text-center py-12">
            <Radio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">No stations found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>


    </div>
  );
};

export default RadioPage;

