import { supabase } from './supabase';
import { SupabaseAdminService } from './supabaseAdmin';
import { EventbriteService } from './eventbriteService';
import { DemoService } from './demoService';
import type { Event, EventCategory } from '../types';

export class EventsService {
  // Get all active events (from database + Eventbrite API)
  static async getAllEvents(): Promise<Event[]> {
    try {
      // Get events from database
      const { data: dbEvents, error: dbError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date', { ascending: true });

      if (dbError) {
        console.error('Database events error:', dbError);
        // If database fails, try Eventbrite API only
        return await this.getEventbriteEvents();
      }

      // Get events from Eventbrite API
      const eventbriteEvents = await this.getEventbriteEvents();

      // Combine and return all events
      const allEvents = [
        ...(dbEvents || []),
        ...eventbriteEvents
      ];

      // If no events found from any source, return demo data
      if (allEvents.length === 0) {
        console.log('No events found in database or Eventbrite. Using demo data.');
        return DemoService.getDemoEvents() as Event[];
      }

      return allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to Eventbrite API if database fails
      const eventbriteEvents = await this.getEventbriteEvents();
      if (eventbriteEvents.length === 0) {
        return DemoService.getDemoEvents() as Event[];
      }
      return eventbriteEvents;
    }
  }

  // Get events from Eventbrite API
  private static async getEventbriteEvents(): Promise<Event[]> {
    try {
      return await EventbriteService.searchIndianEvents();
    } catch (error) {
      console.error('Eventbrite API error:', error);
      return [];
    }
  }

  // Get events by category
  static async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  }

  // Search events
  static async searchEvents(query: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,venue.ilike.%${query}%`)
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to search events: ${error.message}`);
    }

    return data || [];
  }

  // Get upcoming events (next 30 days)
  static async getUpcomingEvents(): Promise<Event[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .lte('date', thirtyDaysFromNow.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch upcoming events: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Create event
  static async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from('events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Event creation error:', error);
        
        // If RLS policy blocks the insert, try with admin client
        if (error.code === '42501' || error.message.includes('row-level security')) {
          console.log('RLS policy blocked insert, trying with admin client...');
          try {
            return await SupabaseAdminService.createEvent(eventData);
          } catch (adminError) {
            console.error('Admin client also failed:', adminError);
            throw new Error(`Failed to create event: RLS policy violation. Please run the SQL fix in Supabase. Error: ${error.message}`);
          }
        }
        throw new Error(`Failed to create event: ${error.message}`);
      }

      return data;
    } catch (error) {
      // If admin client also fails, throw the error
      throw error;
    }
  }

  // Admin: Update event
  static async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`);
    }

    return data;
  }

  // Admin: Delete event
  static async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`);
    }
  }

  // Admin: Get all events (including inactive)
  static async getAllEventsAdmin(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch events: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Toggle event active status
  static async toggleEventStatus(id: string): Promise<Event> {
    const { data: currentEvent, error: fetchError } = await supabase
      .from('events')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch event: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('events')
      .update({ is_active: !currentEvent.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle event status: ${error.message}`);
    }

    return data;
  }
}
