import { useState, useEffect, useCallback } from 'react';
import { GeolocationService } from '../utils/geolocation';
import type { Location } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
    console.log('🔍 useGeolocation: getLocation called');
    try {
      setLoading(true);
      setError(null);
      const currentLocation = await GeolocationService.getLocationWithFallback();
      setLocation(currentLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const refreshLocation = useCallback(() => {
    getLocation();
  }, [getLocation]);

  return {
    location,
    loading,
    error,
    refreshLocation,
    isSupported: GeolocationService.isGeolocationSupported()
  };
};
