import { useState, useCallback } from 'react';
import { SuggestionsService, SearchSuggestion } from '../services/suggestionsService';
import type { Location } from '../types';

export const useSearchSuggestions = (location?: Location) => {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get suggestions from Google Places API
      const apiSuggestions = await SuggestionsService.getSuggestions(query, location);
      console.log('API suggestions received:', apiSuggestions); // Debug log
      
      // If no API suggestions, show popular suggestions
      if (apiSuggestions.length === 0) {
        const popularSuggestions = SuggestionsService.getPopularSuggestions()
          .filter(suggestion => 
            suggestion.description.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 5);
        console.log('Using popular suggestions:', popularSuggestions); // Debug log
        setSuggestions(popularSuggestions);
      } else {
        console.log('Using API suggestions:', apiSuggestions); // Debug log
        setSuggestions(apiSuggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
      
      // Fallback to popular suggestions
      const popularSuggestions = SuggestionsService.getPopularSuggestions()
        .filter(suggestion => 
          suggestion.description.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(popularSuggestions);
    } finally {
      setLoading(false);
    }
  }, [location]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions
  };
};
