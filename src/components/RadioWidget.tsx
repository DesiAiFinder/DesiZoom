import { useState, useEffect } from 'react';
import { Play, Pause, Radio as RadioIcon, Loader2, SkipForward, SkipBack, ChevronDown, ChevronUp } from 'lucide-react';
import { useRadio } from '../hooks/useRadio';
import { Link } from 'react-router-dom';

const RadioWidget = () => {
  const {
    isPlaying,
    isLoading,
    currentStation,
    stations,
    error,
    pause,
    resume,
    playStation,
    playNext,
    playPrevious,
    fetchStationsByCountry,
    detectUserCountry
  } = useRadio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [stationsLoading, setStationsLoading] = useState(false);

  // Initialize stations on mount
  useEffect(() => {
    const initializeStations = async () => {
      if (stations.length === 0) {
        setStationsLoading(true);
        try {
          await detectUserCountry();
          await fetchStationsByCountry();
        } catch (error) {
          console.error('Error initializing stations:', error);
        } finally {
          setStationsLoading(false);
        }
      }
    };

    initializeStations();
  }, [stations.length, fetchStationsByCountry, detectUserCountry]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      if (currentStation) {
        resume();
      } else if (stations.length > 0) {
        // Play first available station
        playStation(stations[0]);
      } else {
        // Try to initialize and play
        const initializeAndPlay = async () => {
          setStationsLoading(true);
          try {
            await detectUserCountry();
            const loadedStations = await fetchStationsByCountry();
            if (loadedStations.length > 0) {
              playStation(loadedStations[0]);
            }
          } catch (error) {
            console.error('Error initializing and playing:', error);
          } finally {
            setStationsLoading(false);
          }
        };
        initializeAndPlay();
      }
    }
  };


  // Get popular stations for quick selection (top 6)
  const popularStations = stations.slice(0, 6);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact View */}
      <div className="p-3 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <RadioIcon className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-900">Radio</h3>
          </div>
          <div className="flex items-center space-x-2">
            {error && (
              <span className="text-xs text-red-600">Error</span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors touch-target"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            <Link 
              to="/radio" 
              className="text-xs text-primary-600 hover:text-primary-700 font-medium touch-target px-2 py-1"
            >
              View All
            </Link>
          </div>
        </div>

        {/* Current Station Info */}
        {currentStation ? (
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
            {/* Station Logo/Icon */}
            {currentStation.logo ? (
              <img 
                src={currentStation.logo} 
                alt={currentStation.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <RadioIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            )}

            {/* Station Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {currentStation.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentStation.genre} • {currentStation.country}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-xs text-gray-500 text-center">
              {stationsLoading ? 'Loading stations...' : 'Select a station to start'}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3">
          {/* Previous Button */}
          <button
            onClick={playPrevious}
            disabled={isLoading || stations.length === 0}
            className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            aria-label="Previous station"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={isLoading || (stations.length === 0 && !stationsLoading)}
            className="p-3 sm:p-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-target flex-shrink-0"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading || stationsLoading ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
            )}
          </button>

          {/* Next Button */}
          <button
            onClick={playNext}
            disabled={isLoading || stations.length === 0}
            className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            aria-label="Next station"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Expanded View - Quick Station Selection */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50 max-h-64 overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Stations</h4>
          <div className="space-y-1">
            {popularStations.length > 0 ? (
              popularStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => playStation(station)}
                  className={`w-full text-left p-2 rounded-lg transition-colors touch-target ${
                    currentStation?.id === station.id
                      ? 'bg-primary-100 text-primary-900 border border-primary-300'
                      : 'bg-white hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {station.logo ? (
                      <img 
                        src={station.logo} 
                        alt={station.name}
                        className="w-8 h-8 rounded flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center flex-shrink-0">
                        <RadioIcon className="w-4 h-4 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{station.name}</p>
                      <p className="text-xs text-gray-500 truncate">{station.genre}</p>
                    </div>
                    {currentStation?.id === station.id && isPlaying && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : stationsLoading ? (
              <div className="text-center py-4">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                <p className="text-xs text-gray-500 mt-2">Loading stations...</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">No stations available</p>
                <Link 
                  to="/radio" 
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block"
                >
                  Browse all stations
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RadioWidget;

