import { useState, useEffect, useCallback, useRef } from 'react';
import { EventsService } from '../services/eventsService';
import type { Event, EventCategory } from '../types';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchEvents = useCallback(async () => {
    console.log('🔍 useEvents: fetchEvents called');
    try {
      setLoading(true);
      setError(null);
      const data = await EventsService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchEvents();
      hasInitialized.current = true;
    }
  }, [fetchEvents]);

  const searchEvents = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventsService.searchEvents(query);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search events');
    } finally {
      setLoading(false);
    }
  }, []);

  const getEventsByCategory = useCallback(async (category: EventCategory) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventsService.getEventsByCategory(category);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  const getUpcomingEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventsService.getUpcomingEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming events');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    events,
    loading,
    error,
    fetchEvents,
    searchEvents,
    getEventsByCategory,
    getUpcomingEvents
  };
};
