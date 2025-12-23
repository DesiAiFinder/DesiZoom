import { useState, useCallback } from 'react';
import { GooglePlacesService } from '../services/googlePlaces';
import type { Business, Location, BusinessCategory, SearchFilters } from '../types';

export const usePlacesSearch = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBusinesses = useCallback(async (
    location: Location,
    category: BusinessCategory,
    filters: SearchFilters = {},
    customQuery?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const radius = (filters.radius || 10) * 1609; // Convert miles to meters
      const results = await GooglePlacesService.searchIndianBusinesses(
        location,
        category,
        radius,
        customQuery
      );

      // Apply additional filters
      let filteredResults = results;

      if (filters.priceLevel !== undefined) {
        filteredResults = filteredResults.filter(
          business => business.priceLevel === filters.priceLevel
        );
      }

      if (filters.rating !== undefined) {
        filteredResults = filteredResults.filter(
          business => (business.rating || 0) >= filters.rating!
        );
      }

      if (filters.openNow) {
        // Note: This would require additional API calls to check opening hours
        // For now, we'll skip this filter
      }

      setBusinesses(filteredResults);
    } catch (err) {
      console.error('Error in searchBusinesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to search businesses');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setBusinesses([]);
    setError(null);
  }, []);

  return {
    businesses,
    loading,
    error,
    searchBusinesses,
    clearResults
  };
};
