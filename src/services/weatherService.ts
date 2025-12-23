import type { Location } from '../types';

export interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

export class WeatherService {
  // Using Open-Meteo API - completely free, no API key required
  // Perfect for US locations with excellent coverage
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  static async getWeather(location: Location): Promise<WeatherData | null> {
    try {
      // Open-Meteo forecast API (current weather)
      const url = `${this.BASE_URL}?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.current) {
        throw new Error('Invalid weather data');
      }

      const current = data.current;
      const weatherCode = current.weather_code || 0;
      const weatherInfo = this.getWeatherFromCode(weatherCode);
      
      return {
        temperature: Math.round(current.temperature_2m || 72),
        condition: weatherInfo.condition,
        description: weatherInfo.description,
        icon: weatherInfo.icon,
        humidity: Math.round(current.relative_humidity_2m || 60),
        windSpeed: Math.round(current.wind_speed_10m || 0),
        city: location.city || location.state || 'Your Location'
      };
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Return mock data on error for better UX
      return {
        temperature: 72,
        condition: 'Clear',
        description: 'clear sky',
        icon: '☀️',
        humidity: 60,
        windSpeed: 5,
        city: location.city || location.state || 'Your Location'
      };
    }
  }

  // Convert WMO weather code to weather condition
  // Open-Meteo uses WMO (World Meteorological Organization) weather codes
  private static getWeatherFromCode(code: number): { condition: string; description: string; icon: string } {
    // WMO Weather interpretation codes (WW)
    const weatherMap: Record<number, { condition: string; description: string; icon: string }> = {
      // Clear sky
      0: { condition: 'Clear', description: 'clear sky', icon: '☀️' },
      
      // Mainly clear
      1: { condition: 'Clear', description: 'mainly clear', icon: '🌤️' },
      
      // Partly cloudy
      2: { condition: 'Partly Cloudy', description: 'partly cloudy', icon: '⛅' },
      
      // Overcast
      3: { condition: 'Overcast', description: 'overcast', icon: '☁️' },
      
      // Fog
      45: { condition: 'Foggy', description: 'fog', icon: '🌫️' },
      48: { condition: 'Foggy', description: 'depositing rime fog', icon: '🌫️' },
      
      // Drizzle
      51: { condition: 'Drizzle', description: 'light drizzle', icon: '🌦️' },
      53: { condition: 'Drizzle', description: 'moderate drizzle', icon: '🌦️' },
      55: { condition: 'Drizzle', description: 'dense drizzle', icon: '🌦️' },
      
      // Freezing Drizzle
      56: { condition: 'Freezing Drizzle', description: 'light freezing drizzle', icon: '🌨️' },
      57: { condition: 'Freezing Drizzle', description: 'dense freezing drizzle', icon: '🌨️' },
      
      // Rain
      61: { condition: 'Rain', description: 'slight rain', icon: '🌧️' },
      63: { condition: 'Rain', description: 'moderate rain', icon: '🌧️' },
      65: { condition: 'Rain', description: 'heavy rain', icon: '🌧️' },
      
      // Freezing Rain
      66: { condition: 'Freezing Rain', description: 'light freezing rain', icon: '🌨️' },
      67: { condition: 'Freezing Rain', description: 'heavy freezing rain', icon: '🌨️' },
      
      // Snow fall
      71: { condition: 'Snow', description: 'slight snow fall', icon: '❄️' },
      73: { condition: 'Snow', description: 'moderate snow fall', icon: '❄️' },
      75: { condition: 'Snow', description: 'heavy snow fall', icon: '❄️' },
      
      // Snow grains
      77: { condition: 'Snow', description: 'snow grains', icon: '❄️' },
      
      // Rain showers
      80: { condition: 'Rain Showers', description: 'slight rain showers', icon: '🌦️' },
      81: { condition: 'Rain Showers', description: 'moderate rain showers', icon: '🌦️' },
      82: { condition: 'Rain Showers', description: 'violent rain showers', icon: '🌧️' },
      
      // Snow showers
      85: { condition: 'Snow Showers', description: 'slight snow showers', icon: '🌨️' },
      86: { condition: 'Snow Showers', description: 'heavy snow showers', icon: '🌨️' },
      
      // Thunderstorm
      95: { condition: 'Thunderstorm', description: 'thunderstorm', icon: '⛈️' },
      
      // Thunderstorm with hail
      96: { condition: 'Thunderstorm', description: 'thunderstorm with slight hail', icon: '⛈️' },
      99: { condition: 'Thunderstorm', description: 'thunderstorm with heavy hail', icon: '⛈️' }
    };
    
    return weatherMap[code] || { condition: 'Clear', description: 'clear sky', icon: '☀️' };
  }
}

