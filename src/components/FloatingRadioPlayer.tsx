import React from 'react';
import { Play, Pause, Volume2, VolumeX, X, SkipForward, SkipBack } from 'lucide-react';
import { useRadio } from '../hooks/useRadio';

interface FloatingRadioPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

const FloatingRadioPlayer: React.FC<FloatingRadioPlayerProps> = ({ isVisible, onClose }) => {
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
    playPrevious
  } = useRadio();

  if (!isVisible || !currentStation) return null;

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
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              {currentStation.logo ? (
                <img 
                  src={currentStation.logo} 
                  alt={currentStation.name}
                  className="w-8 h-8 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-5 h-5 bg-white rounded-full flex items-center justify-center ${currentStation.logo ? 'hidden' : ''}`}>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">{currentStation.name}</h3>
              <p className="text-xs text-gray-600">{currentStation.genre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={playPrevious}
              disabled={isLoading || stations.length === 0}
              className="radio-control-btn p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-3 h-3" />
            </button>
            
            <button
              onClick={stop}
              className="radio-control-btn p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
            </button>
            
            <button
              onClick={handlePlayPause}
              disabled={isLoading}
              className="radio-control-btn p-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              disabled={isLoading || stations.length === 0}
              className="radio-control-btn p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-3 h-3" />
            </button>

            <button
              onClick={toggleMute}
              className="radio-control-btn p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {volume > 0 ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider w-16"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-xs">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingRadioPlayer;
