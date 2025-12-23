import type { Location } from '../types';
import { config } from '../config/env';

export class GeolocationService {
  // Get user's current location
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(config.app.defaultLocation);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          // Try to get city name from coordinates
          this.getCityFromCoordinates(location)
            .then(locationWithCity => resolve(locationWithCity))
            .catch(() => resolve(location));
        },
        (error: GeolocationPositionError) => {
          console.warn('Geolocation error:', error);
          // Error logged but not used
          // const geolocationError: GeolocationError = {
          //   code: error.code,
          //   message: this.getGeolocationErrorMessage(error.code)
          // };
          
          // Fallback to default location
          resolve(config.app.defaultLocation);
        },
        options
      );
    });
  }

  // Get city name from coordinates using reverse geocoding
  private static async getCityFromCoordinates(location: Location): Promise<Location> {
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${config.googlePlaces.apiKey}`;
      const url = proxyUrl + encodeURIComponent(apiUrl);
      
      const response = await fetch(url);
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;
        
        let city = '';
        let state = '';
        
        for (const component of addressComponents) {
          if (component.types.includes('locality')) {
            city = component.long_name;
          } else if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
        }
        
        return {
          ...location,
          city,
          state,
          address: result.formatted_address
        };
      }
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
    }
    
    return location;
  }

  // Get error message for geolocation error codes
  // @ts-ignore - unused but kept for potential future use
  private static getGeolocationErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied. Please allow location access to find nearby businesses.';
      case 2:
        return 'Location unavailable. Please check your internet connection.';
      case 3:
        return 'Location request timed out. Please try again.';
      default:
        return 'Unable to get your location. Using default location.';
    }
  }

  // Check if geolocation is supported
  static isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  // Get location from browser's geolocation with fallback
  static async getLocationWithFallback(): Promise<Location> {
    try {
      const location = await this.getCurrentLocation();
      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      return config.app.defaultLocation;
    }
  }

  // Calculate distance between two points
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format distance for display
  static formatDistance(distance: number): string {
    if (distance < 0.1) {
      return '< 0.1 mi';
    } else if (distance < 1) {
      return `${distance.toFixed(1)} mi`;
    } else {
      return `${Math.round(distance)} mi`;
    }
  }

  // Get location display string
  static getLocationDisplay(location: Location): string {
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    } else if (location.address) {
      return location.address;
    } else {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
  }
}
