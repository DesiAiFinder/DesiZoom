import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { GeolocationService } from '../utils/geolocation';
import type { Location } from '../types';

interface LocationContextType {
  location: Location | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => void;
  isSupported: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const getLocation = useCallback(async () => {
    // Only get location once at app startup
    if (hasInitialized.current) {
      console.log('🔍 LocationContext: Skipping location fetch - already initialized');
      return;
    }

    console.log('🔍 LocationContext: Initial location fetch at app startup');
    hasInitialized.current = true;
    
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
    // Allow manual refresh but reset the flag
    hasInitialized.current = false;
    getLocation();
  }, [getLocation]);

  const value: LocationContextType = {
    location,
    loading,
    error,
    refreshLocation,
    isSupported: GeolocationService.isGeolocationSupported()
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
