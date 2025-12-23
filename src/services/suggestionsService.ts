import { config } from '../config/env';

export interface SearchSuggestion {
  id: string;
  description: string;
  placeId?: string;
  types?: string[];
}

export class SuggestionsService {
  private static readonly BASE_URL = 'https://maps.googleapis.com/maps/api/place';
  private static readonly API_KEY = config.googlePlaces.apiKey;

  // Get autocomplete suggestions
  static async getSuggestions(
    query: string,
    location?: { lat: number; lng: number },
    radius: number = 50000 // 50km radius
  ): Promise<SearchSuggestion[]> {
    if (query.length < 2) {
      return [];
    }

    try {
      // Use CORS proxy to avoid CORS issues
      const proxyUrl = 'https://api.allorigins.win/raw?url=';
      const locationParam = location 
        ? `&location=${location.lat},${location.lng}&radius=${radius}`
        : '';
      const apiUrl = `${this.BASE_URL}/autocomplete/json?input=${encodeURIComponent(query)}${locationParam}&key=${this.API_KEY}`;
      const url = proxyUrl + encodeURIComponent(apiUrl);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      if (!data.predictions || data.predictions.length === 0) {
        return [];
      }

      console.log('Raw API response predictions:', data.predictions); // Debug log
      
      // Filter and format suggestions
      const suggestions: SearchSuggestion[] = data.predictions
        .filter((prediction: any) => {
          // Filter for business-related suggestions
          const description = prediction.description.toLowerCase();
          const isBusiness = description.includes('restaurant') || 
                 description.includes('store') || 
                 description.includes('shop') || 
                 description.includes('business') ||
                 description.includes('indian') ||
                 description.includes('temple') ||
                 description.includes('travel');
          console.log(`Suggestion "${prediction.description}" - isBusiness: ${isBusiness}`); // Debug log
          return isBusiness;
        })
        .slice(0, 5) // Limit to 5 suggestions
        .map((prediction: any) => ({
          id: prediction.place_id,
          description: prediction.description,
          placeId: prediction.place_id,
          types: prediction.types
        }));
      
      console.log('Filtered suggestions:', suggestions); // Debug log

      return suggestions;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    }
  }

  // Get popular Indian business suggestions
  static getPopularSuggestions(): SearchSuggestion[] {
    return [
      { id: 'indian-restaurant', description: 'Indian Restaurant' },
      { id: 'indian-grocery', description: 'Indian Grocery Store' },
      { id: 'hindu-temple', description: 'Hindu Temple' },
      { id: 'indian-travel', description: 'Indian Travel Agency' },
      { id: 'indian-services', description: 'Indian Services' },
      { id: 'indian-clothing', description: 'Indian Clothing Store' },
      { id: 'indian-jewelry', description: 'Indian Jewelry Store' },
      { id: 'indian-bakery', description: 'Indian Bakery' },
      { id: 'indian-spices', description: 'Indian Spices Store' },
      { id: 'indian-vegetables', description: 'Indian Vegetables Store' }
    ];
  }
}
