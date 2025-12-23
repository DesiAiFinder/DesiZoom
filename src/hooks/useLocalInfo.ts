import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalInfoService } from '../services/localInfoService';
import type { LocalInfo } from '../types';

export const useLocalInfo = () => {
  const [localInfo, setLocalInfo] = useState<LocalInfo[]>([]);
  const [cityInfo] = useState<LocalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchLocalInfo = useCallback(async () => {
    console.log('🔍 useLocalInfo: fetchLocalInfo called');
    try {
      setLoading(true);
      setError(null);
      const allInfo = await LocalInfoService.getAllLocalInfoData();
      setLocalInfo(allInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch local info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchLocalInfo();
      hasInitialized.current = true;
    }
  }, [fetchLocalInfo]);

  const getLocalInfoByType = useCallback(async (type: LocalInfo['type']) => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.getLocalInfoByType(type);
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch local info');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchLocalInfo = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.searchLocalInfo(query);
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search local info');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUtilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.getAllLocalInfoData();
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch utilities');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEmergencyContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.getAllLocalInfoData();
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  const getGovernmentServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.getAllLocalInfoData();
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch government services');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrashRecycling = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await LocalInfoService.getAllLocalInfoData();
      setLocalInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trash and recycling info');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    localInfo,
    cityInfo,
    loading,
    error,
    fetchLocalInfo,
    getLocalInfoByType,
    searchLocalInfo,
    getUtilities,
    getEmergencyContacts,
    getGovernmentServices,
    getTrashRecycling
  };
};
