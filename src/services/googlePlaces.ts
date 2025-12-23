import { config } from '../config/env';
import type { Business, Location, BusinessCategory } from '../types';

export class GooglePlacesService {
  private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api/place';
  private static readonly API_KEY = config.googlePlaces.apiKey;

  // Search for nearby places
  static async searchNearby(
    location: Location,
    type: string,
    radius: number = 16000 // 10 miles in meters
  ): Promise<Business[]> {
    const url = `${this.BASE_URL}/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${this.API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const businesses = await Promise.all(
        (data.results || []).map(async (place: any) => {
          const business = await this.enhancePlaceDetails(place, location);
          return business;
        })
      );

      return businesses.filter(Boolean);
    } catch (error) {
      console.error('Error searching nearby places:', error);
      throw new Error('Failed to search nearby places');
    }
  }

  // Search for specific Indian businesses
  static async searchIndianBusinesses(
    location: Location,
    category: BusinessCategory,
    radius: number = 16000,
    customQuery?: string
  ): Promise<Business[]> {
    // Use custom query if provided, otherwise use default category query
    const searchQuery = customQuery 
      ? `${customQuery.trim()} Indian ${this.getCategoryKeyword(category)}`
      : this.getSingleSearchQuery(category);
    
    try {
      const businesses = await this.textSearch(searchQuery, location, radius);
      return businesses.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error(`Error searching for ${searchQuery}:`, error);
      return [];
    }
  }

  // Text search for specific queries
  private static async textSearch(
    query: string,
    location: Location,
    radius: number
  ): Promise<Business[]> {
    // Use CORS proxy to avoid CORS issues
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = `${this.BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}&location=${location.lat},${location.lng}&radius=${radius}&key=${this.API_KEY}`;
    const url = proxyUrl + encodeURIComponent(apiUrl);

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      if (!data.results || data.results.length === 0) {
        return [];
      }

      const businesses = await Promise.all(
        data.results.map(async (place: any) => {
          try {
            const business = await this.enhancePlaceDetails(place, location);
            return business;
          } catch (error) {
            console.error('Error enhancing place details:', error);
            return null;
          }
        })
      );

      return businesses.filter(Boolean);
    } catch (error) {
      console.error('Error in text search:', error);
      return [];
    }
  }

  // Get place details
  static async getPlaceDetails(placeId: string): Promise<any> {
    const fields = 'name,formatted_address,formatted_phone_number,website,rating,price_level,photos,opening_hours,types';
    const proxyUrl = 'https://api.allorigins.win/raw?url=';
    const apiUrl = `${this.BASE_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${this.API_KEY}`;
    const url = proxyUrl + encodeURIComponent(apiUrl);

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      return data.result;
    } catch (error) {
      console.error('Error getting place details:', error);
      throw new Error('Failed to get place details');
    }
  }

  // Get phone number for a place
  static async getPlacePhoneNumber(placeId: string): Promise<string | null> {
    try {
      const details = await this.getPlaceDetails(placeId);
      return details.formatted_phone_number || null;
    } catch (error) {
      console.error('Error getting phone number:', error);
      return null;
    }
  }

  // Enhance place with additional details and calculate distance
  private static async enhancePlaceDetails(place: any, userLocation: Location): Promise<Business | null> {
    try {
      // Calculate distance
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      // Determine category
      const category = this.determineCategory(place.types);

      // Generate photo URLs with CORS proxy
      const photoUrls = place.photos?.slice(0, 3).map((photo: any) => {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.API_KEY}`;
        // Use CORS proxy for images
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(photoUrl)}`;
      }) || [];

      // Note: Phone and website are fetched on-demand to avoid excessive API calls
      // They can be fetched later using getPlaceDetails() if needed
      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        phone: undefined, // Can be fetched on-demand via getPlaceDetails
        website: undefined, // Can be fetched on-demand via getPlaceDetails
        rating: place.rating,
        priceLevel: place.price_level,
        photos: photoUrls,
        placeId: place.place_id,
        types: place.types,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        category
      };
    } catch (error) {
      console.error('Error enhancing place details:', error);
      return null;
    }
  }

  // Calculate distance between two points using Haversine formula
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Determine business category based on Google Places types
  private static determineCategory(types: string[]): BusinessCategory {
    const typeString = types.join(' ').toLowerCase();
    
    if (typeString.includes('grocery') || typeString.includes('supermarket') || typeString.includes('food')) {
      return 'grocery';
    }
    if (typeString.includes('restaurant') || typeString.includes('meal')) {
      return 'restaurant';
    }
    if (typeString.includes('hindu_temple') || typeString.includes('place_of_worship')) {
      return 'temple';
    }
    if (typeString.includes('travel_agency') || typeString.includes('tourist')) {
      return 'travel';
    }
    if (typeString.includes('electrician') || typeString.includes('plumber') || typeString.includes('contractor')) {
      return 'services';
    }
    
    return 'other';
  }

  // Get single search query for each category
  private static getSingleSearchQuery(category: BusinessCategory): string {
    const queries: Record<BusinessCategory, string> = {
      grocery: 'Indian grocery store',
      restaurant: 'Indian restaurant',
      temple: 'Hindu temple',
      travel: 'Indian travel agency',
      services: 'Indian services',
      other: 'Indian business'
    };

    return queries[category] || 'Indian business';
  }

  // Get category keyword for custom queries
  private static getCategoryKeyword(category: BusinessCategory): string {
    const keywords: Record<BusinessCategory, string> = {
      grocery: 'grocery store',
      restaurant: 'restaurant',
      temple: 'temple',
      travel: 'travel agency',
      services: 'services',
      other: 'business'
    };

    return keywords[category] || 'business';
  }

}
