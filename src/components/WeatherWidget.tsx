import { useEffect, useState } from 'react';
import { Droplet, Wind } from 'lucide-react';
import { useLocationContext } from '../contexts/LocationContext';
import { WeatherService, type WeatherData } from '../services/weatherService';

const WeatherWidget = () => {
  const { location } = useLocationContext();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await WeatherService.getWeather(location);
        setWeather(data);
      } catch (error) {
        console.error('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);


  if (loading || !weather) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-sm border border-blue-200 p-3 sm:p-4 h-full flex flex-col">
      {/* Weather Section */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Today's Weather</h3>
          <p className="text-xs text-gray-500">{weather.city}</p>
        </div>
        <div className="text-4xl">{weather.icon}</div>
      </div>
      
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-gray-900">
            {weather.temperature}°F
          </div>
          <p className="text-xs text-gray-600 capitalize mt-1">
            {weather.description}
          </p>
        </div>
        
        <div className="flex space-x-3 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <Droplet className="w-3 h-3" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1">
            <Wind className="w-3 h-3" />
            <span>{weather.windSpeed} mph</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default WeatherWidget;

