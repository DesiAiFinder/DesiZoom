import React from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Radio, 
  SkipForward,
  SkipBack,
  Loader2,
  AlertCircle,
  Heart,
  X
} from 'lucide-react';
import { useRadio } from '../hooks/useRadio';

const PersistentRadioFooter: React.FC = () => {
  const {
    isPlaying,
    isLoading,
    currentStation,
    volume,
    error,
    stations,
    pause,
    resume,
    stop,
    setVolume,
    playNext,
    playPrevious,
    toggleLikeStation,
    isStationLiked
  } = useRadio();

  if (!currentStation) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.7);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Station Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              {currentStation.logo ? (
                <img 
                  src={currentStation.logo} 
                  alt={currentStation.name}
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Radio className={`w-6 h-6 text-white ${currentStation.logo ? 'hidden' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {currentStation.name}
              </h3>
              <p className="text-gray-600 text-sm truncate">
                {currentStation.description}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                  {currentStation.genre}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {currentStation.language}
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {currentStation.country}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLikeStation(currentStation.id);
              }}
              className={`p-2 rounded-full transition-colors ${
                isStationLiked(currentStation.id)
                  ? 'text-pink-500 bg-pink-50'
                  : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${isStationLiked(currentStation.id) ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={playPrevious}
              disabled={isLoading || stations.length === 0}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                stop();
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <div className="w-4 h-4 bg-gray-600 rounded-sm"></div>
            </button>
            
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={isLoading || stations.length === 0}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {volume > 0 ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider w-20"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                stop();
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              title="Close Radio Player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersistentRadioFooter;
