import { useState, useEffect, useCallback } from 'react';
import { radioBrowserService, RadioStation, RadioPlayerState, SortOrder } from '../services/radioBrowserService';

export const useRadio = () => {
  const [state, setState] = useState<RadioPlayerState>({
    isPlaying: false,
    isLoading: false,
    currentStation: null,
    volume: 0.7,
    error: null,
    currentIndex: 0,
    stations: [],
    sortOrder: 'clickcount',
    sortDirection: 'desc',
    hideBroken: true,
    likedStations: []
  });

  useEffect(() => {
    const unsubscribe = radioBrowserService.subscribe(setState);
    return unsubscribe;
  }, []);

  const playStation = useCallback(async (station: RadioStation) => {
    await radioBrowserService.playStation(station);
  }, []);

  const pause = useCallback(() => {
    radioBrowserService.pause();
  }, []);

  const resume = useCallback(() => {
    radioBrowserService.resume();
  }, []);

  const stop = useCallback(() => {
    radioBrowserService.stop();
  }, []);

  const setVolume = useCallback((volume: number) => {
    radioBrowserService.setVolume(volume);
  }, []);

  const playNext = useCallback(async () => {
    await radioBrowserService.playNext();
  }, []);

  const playPrevious = useCallback(async () => {
    await radioBrowserService.playPrevious();
  }, []);

  const getStations = useCallback(() => {
    return radioBrowserService.getStations();
  }, []);

  const getCurrentIndex = useCallback(() => {
    return radioBrowserService.getCurrentIndex();
  }, []);

  const getAvailableCountries = useCallback(async () => {
    return radioBrowserService.getAvailableCountries();
  }, []);

  const getAvailableLanguages = useCallback(async () => {
    return radioBrowserService.getAvailableLanguages();
  }, []);

  const detectUserCountry = useCallback(async () => {
    return radioBrowserService.detectUserCountry();
  }, []);

  const fetchStationsByCountry = useCallback(async (countryCode?: string) => {
    return radioBrowserService.fetchStationsByCountry(countryCode);
  }, []);

  const setCountry = useCallback(async (countryCode: string) => {
    return radioBrowserService.setCountry(countryCode);
  }, []);

  const setSortOrder = useCallback(async (order: SortOrder) => {
    return radioBrowserService.setSortOrder(order);
  }, []);

  const toggleSortDirection = useCallback(async () => {
    return radioBrowserService.toggleSortDirection();
  }, []);

  const toggleHideBroken = useCallback(async () => {
    return radioBrowserService.toggleHideBroken();
  }, []);

  const toggleLikeStation = useCallback((stationId: string) => {
    return radioBrowserService.toggleLikeStation(stationId);
  }, []);

  const isStationLiked = useCallback((stationId: string) => {
    return radioBrowserService.isStationLiked(stationId);
  }, []);

  const getLikedStations = useCallback(() => {
    return radioBrowserService.getLikedStations();
  }, []);

  return {
    ...state,
    playStation,
    pause,
    resume,
    stop,
    setVolume,
    playNext,
    playPrevious,
    getStations,
    getCurrentIndex,
    getAvailableCountries,
    getAvailableLanguages,
    detectUserCountry,
    fetchStationsByCountry,
    setCountry,
    setSortOrder,
    toggleSortDirection,
    toggleHideBroken,
    toggleLikeStation,
    isStationLiked,
    getLikedStations
  };
};
