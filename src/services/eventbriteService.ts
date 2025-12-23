import type { Event } from '../types';

export class EventbriteService {
  // Note: You'll need to get an Eventbrite API key from https://www.eventbrite.com/platform/api-keys/
  private static readonly API_KEY = 'YOUR_EVENTBRITE_API_KEY'; // Replace with your actual API key
  private static readonly BASE_URL = 'https://www.eventbriteapi.com/v3';

  // Search for Indian community events
  static async searchIndianEvents(location?: string): Promise<Event[]> {
    try {
      // Check if API key is configured
      if (this.API_KEY === 'YOUR_EVENTBRITE_API_KEY') {
        console.log('Eventbrite API key not configured. Get your API key from: https://www.eventbrite.com/platform/api-keys/');
        return [];
      }
      
      const params = new URLSearchParams({
        q: 'Indian community',
        location: location || 'United States',
        expand: 'venue',
        status: 'live'
      });

      const response = await fetch(`${this.BASE_URL}/events/search/?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.events?.map((event: any) => ({
        id: event.id,
        title: event.name.text,
        description: event.description.text,
        date: event.start.local.split('T')[0],
        time: event.start.local.split('T')[1]?.split('.')[0],
        venue: event.venue?.name || 'TBD',
        address: event.venue?.address?.localized_address_display || 'TBD',
        price: event.is_free ? 'Free' : 'Paid',
        link: event.url,
        category: 'cultural',
        source: 'eventbrite',
        external_id: event.id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) || [];
    } catch (error) {
      console.error('Eventbrite API error:', error);
      return [];
    }
  }

  // Get event details
  static async getEventDetails(eventId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BASE_URL}/events/${eventId}/`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Eventbrite API error:', error);
      return null;
    }
  }
}
