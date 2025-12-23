import { useState, useEffect, useCallback, useRef } from 'react';
import { DealsService } from '../services/dealsService';
import type { Deal, DealCategory } from '../types';

export const useDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchDeals = useCallback(async () => {
    console.log('🔍 useDeals: fetchDeals called');
    try {
      setLoading(true);
      setError(null);
      const data = await DealsService.getAllDeals();
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchDeals();
      hasInitialized.current = true;
    }
  }, [fetchDeals]);

  const searchDeals = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealsService.searchDeals(query);
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search deals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getDealsByCategory = useCallback(async (category: DealCategory) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealsService.getDealsByCategory(category);
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealsService.getActiveDeals();
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch active deals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeaturedDeals = useCallback(async (limit: number = 3) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DealsService.getFeaturedDeals(limit);
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch featured deals');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deals,
    loading,
    error,
    fetchDeals,
    searchDeals,
    getDealsByCategory,
    getActiveDeals,
    getFeaturedDeals
  };
};
