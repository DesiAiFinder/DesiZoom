import { supabase } from './supabase';

export interface SearchSuggestion {
  id: string;
  query: string;
  count: number;
  location: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  created_at: string;
  updated_at: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  radius_km?: number;
}

export interface AutoSuggestion {
  query: string;
  count: number;
  isComplete: boolean;
}

export class SearchSuggestionsService {
  // Calculate distance between two coordinates using Haversine formula
  private static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }
  // Get auto-suggestions based on Google-like patterns and external sources
  static async getAutoSuggestions(
    partialQuery: string, 
    location: string | null, 
    limit: number = 8
  ): Promise<AutoSuggestion[]> {
    if (!partialQuery.trim() || partialQuery.length < 2) {
      return [];
    }

    try {
      const suggestions: AutoSuggestion[] = [];

      // 1. Get pattern-based suggestions (Google-like completion)
      const patternSuggestions = this.generatePatternSuggestions(partialQuery);
      suggestions.push(...patternSuggestions);

      // 2. Get contextual suggestions based on query analysis
      const contextualSuggestions = this.generateContextualSuggestions(partialQuery);
      suggestions.push(...contextualSuggestions);

      // 3. Get suggestions from marketplace products (as secondary source)
      if (suggestions.length < 5) {
        const productSuggestions = await this.getProductBasedSuggestions(partialQuery, 3);
        suggestions.push(...productSuggestions);
      }

      // 4. Get suggestions from Google Places API (if location available)
      if (location && suggestions.length < 6) {
        const placeSuggestions = await this.getPlaceBasedSuggestions(partialQuery, location, 2);
        suggestions.push(...placeSuggestions);
      }

      // 5. Get external suggestions (Google, Bing, etc.)
      if (suggestions.length < 4) {
        const externalSuggestions = await this.getExternalSuggestions(partialQuery, 2);
        suggestions.push(...externalSuggestions);
      }

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.query === suggestion.query)
        )
        .slice(0, limit);

      return uniqueSuggestions;
    } catch (error) {
      console.error('Error getting auto-suggestions:', error);
      // Fallback to pattern suggestions
      return this.generatePatternSuggestions(partialQuery).slice(0, limit);
    }
  }

  // Get suggestions based on existing marketplace products
  private static async getProductBasedSuggestions(
    partialQuery: string, 
    limit: number
  ): Promise<AutoSuggestion[]> {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('title, category')
        .eq('is_active', true)
        .ilike('title', `${partialQuery}%`)
        .limit(limit);

      if (error) {
        console.error('Error fetching product suggestions:', error);
        return [];
      }

      return (products || []).map(product => ({
        query: product.title,
        count: 0,
        isComplete: true
      }));
    } catch (error) {
      console.error('Error getting product suggestions:', error);
      return [];
    }
  }

  // Get suggestions based on Google Places
  private static async getPlaceBasedSuggestions(
    _partialQuery: string,
    _location: string,
    _limit: number
  ): Promise<AutoSuggestion[]> {
    try {
      // This would integrate with Google Places API for business suggestions
      // For now, return empty array as this requires API key setup
      return [];
    } catch (error) {
      console.error('Error getting place suggestions:', error);
      return [];
    }
  }

  // Get suggestions from external APIs (Google-like)
  private static async getExternalSuggestions(
    _partialQuery: string,
    _limit: number
  ): Promise<AutoSuggestion[]> {
    try {
      // This could integrate with:
      // - Google Search Suggestions API
      // - Bing Search Suggestions API
      // - DuckDuckGo Instant Answer API
      // For now, return empty array as this requires API setup
      return [];
    } catch (error) {
      console.error('Error getting external suggestions:', error);
      return [];
    }
  }

  // Generate contextual suggestions based on query analysis
  private static generateContextualSuggestions(partialQuery: string): AutoSuggestion[] {
    const lowerQuery = partialQuery.toLowerCase().trim();
    const suggestions: AutoSuggestion[] = [];

    // Analyze query context and generate relevant suggestions
    if (lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
      suggestions.push(
        { query: 'best deals on', count: 0, isComplete: false },
        { query: 'cheap', count: 0, isComplete: false },
        { query: 'affordable', count: 0, isComplete: false },
        { query: 'discount', count: 0, isComplete: false }
      );
    }

    if (lowerQuery.includes('find') || lowerQuery.includes('search')) {
      suggestions.push(
        { query: 'near me', count: 0, isComplete: false },
        { query: 'in my area', count: 0, isComplete: false },
        { query: 'local', count: 0, isComplete: false }
      );
    }

    if (lowerQuery.includes('want') || lowerQuery.includes('need')) {
      suggestions.push(
        { query: 'i want to buy', count: 0, isComplete: false },
        { query: 'i need to find', count: 0, isComplete: false },
        { query: 'i am looking for', count: 0, isComplete: false }
      );
    }

    return suggestions.slice(0, 3);
  }

  // Save search query to database with count, location, and coordinates
  static async saveSearchQuery(
    query: string, 
    location: string | null,
    coordinates?: LocationCoordinates
  ): Promise<void> {
    if (!query.trim() || query.length < 2) {
      return;
    }

    try {
      const locationKey = location || 'unknown';
      const trimmedQuery = query.trim();
      
      // Check if query already exists for this location
      const { data: existing } = await supabase
        .from('search_suggestions')
        .select('id, count')
        .eq('query', trimmedQuery)
        .eq('location', locationKey)
        .single();

      if (existing) {
        // Update count
        await supabase
          .from('search_suggestions')
          .update({ 
            count: existing.count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new query with coordinates
        await supabase
          .from('search_suggestions')
          .insert({
            query: trimmedQuery,
            location: locationKey,
            latitude: coordinates?.latitude || null,
            longitude: coordinates?.longitude || null,
            radius_km: coordinates?.radius_km || 10,
            count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Error saving search query:', error);
    }
  }

  // Get trending searches for location (top searches by count)
  static async getTrendingSearches(
    location: string | null,
    limit: number = 8
  ): Promise<SearchSuggestion[]> {
    try {
      const locationKey = location || 'unknown';
      
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('location', locationKey)
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching trending searches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting trending searches:', error);
      return [];
    }
  }

  // Get recent searches for location (most recent searches)
  static async getRecentSearches(
    location: string | null,
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    try {
      const locationKey = location || 'unknown';
      
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .eq('location', locationKey)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent searches:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  // Get searches within radius of user's location
  static async getSearchesWithinRadius(
    userLatitude: number,
    userLongitude: number,
    radiusKm: number = 10,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      // Get all searches with coordinates
      const { data: allSearches, error } = await supabase
        .from('search_suggestions')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching searches with coordinates:', error);
        return [];
      }

      // Filter searches within radius
      const nearbySearches = (allSearches || []).filter(search => {
        if (!search.latitude || !search.longitude) return false;
        
        const distance = this.calculateDistance(
          userLatitude,
          userLongitude,
          search.latitude,
          search.longitude
        );
        
        return distance <= radiusKm;
      });

      // Sort by count and limit results
      return nearbySearches
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting searches within radius:', error);
      return [];
    }
  }

  // Get all searches for location (trending + recent combined)
  static async getAllSearchesForLocation(
    location: string | null,
    userCoordinates?: LocationCoordinates,
    limit: number = 10
  ): Promise<SearchSuggestion[]> {
    try {
      // If we have user coordinates, get searches within radius
      if (userCoordinates?.latitude && userCoordinates?.longitude) {
        const radiusSearches = await this.getSearchesWithinRadius(
          userCoordinates.latitude,
          userCoordinates.longitude,
          userCoordinates.radius_km || 10,
          limit
        );
        
        if (radiusSearches.length > 0) {
          return radiusSearches;
        }
      }

      // Fallback to location-based searches
      // Get trending searches (by count)
      const trendingSearches = await this.getTrendingSearches(location, Math.ceil(limit / 2));
      
      // Get recent searches
      const recentSearches = await this.getRecentSearches(location, Math.ceil(limit / 2));
      
      // Combine and deduplicate
      const allSearches = [...trendingSearches];
      recentSearches.forEach(recent => {
        if (!allSearches.find(search => search.query === recent.query)) {
          allSearches.push(recent);
        }
      });
      
      // Sort by count (trending) and limit results
      return allSearches
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting all searches for location:', error);
      return [];
    }
  }

  // Get popular search terms for auto-completion
  static async getPopularSearchTerms(
    location: string | null,
    limit: number = 10
  ): Promise<string[]> {
    try {
      const locationKey = location || 'unknown';
      
      const { data, error } = await supabase
        .from('search_suggestions')
        .select('query')
        .eq('location', locationKey)
        .order('count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular terms:', error);
        return [];
      }

      return (data || []).map(item => item.query);
    } catch (error) {
      console.error('Error getting popular terms:', error);
      return [];
    }
  }

  // Generate Google-like auto-suggestions based on comprehensive patterns
  static generatePatternSuggestions(partialQuery: string): AutoSuggestion[] {
    const comprehensivePatterns = [
      // Shopping patterns
      'i want to buy',
      'i want to purchase',
      'i need to buy',
      'i am looking for',
      'i am searching for',
      'i want to find',
      'i need to find',
      'i am trying to find',
      'i want to get',
      'i need to get',
      'i am looking to buy',
      'i am looking to purchase',
      'i want to shop for',
      'i need to shop for',
      
      // Deal patterns
      'best deals on',
      'cheap',
      'affordable',
      'discount',
      'sale',
      'offer',
      'promotion',
      'bargain',
      'budget',
      'low price',
      'best price',
      'good deal',
      'great deal',
      'amazing deal',
      
      // Condition patterns
      'used',
      'new',
      'refurbished',
      'second hand',
      'pre owned',
      'like new',
      'excellent condition',
      'good condition',
      'fair condition',
      
      // Location patterns
      'near me',
      'in my area',
      'local',
      'nearby',
      'close to me',
      'in my city',
      'in my town',
      'around here',
      
      // Search patterns
      'search for',
      'find me',
      'show me',
      'help me find',
      'can you find',
      'where can i find',
      'where to buy',
      'where to get',
      'how to buy',
      'how to get',
      
      // Product categories
      'electronics',
      'mobile phones',
      'laptops',
      'computers',
      'smartphones',
      'tablets',
      'headphones',
      'speakers',
      'cameras',
      'cars',
      'bikes',
      'motorcycles',
      'furniture',
      'clothes',
      'shoes',
      'books',
      'toys',
      'games',
      'sports equipment',
      'home appliances',
      'kitchen appliances',
      'beauty products',
      'cosmetics',
      'jewelry',
      'watches',
      'bags',
      'accessories'
    ];

    const suggestions: AutoSuggestion[] = [];
    const lowerQuery = partialQuery.toLowerCase().trim();

    // Find patterns that start with the partial query
    const matchingPatterns = comprehensivePatterns.filter(pattern => 
      pattern.toLowerCase().startsWith(lowerQuery) && 
      pattern.toLowerCase() !== lowerQuery &&
      pattern.toLowerCase().length > lowerQuery.length
    );

    // Sort by relevance (exact start match first, then by length)
    matchingPatterns.sort((a, b) => {
      const aExact = a.toLowerCase().startsWith(lowerQuery);
      const bExact = b.toLowerCase().startsWith(lowerQuery);
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.length - b.length;
    });

    // Add matching patterns as suggestions
    matchingPatterns.slice(0, 8).forEach(pattern => {
      suggestions.push({
        query: pattern,
        count: 0,
        isComplete: false
      });
    });

    // If no exact matches, try partial word matches
    if (suggestions.length === 0) {
      const words = lowerQuery.split(/\s+/);
      const lastWord = words[words.length - 1];
      
      if (lastWord && lastWord.length >= 2) {
        const partialMatches = comprehensivePatterns.filter(pattern => {
          const patternWords = pattern.toLowerCase().split(/\s+/);
          return patternWords.some(word => word.startsWith(lastWord));
        });
        
        partialMatches.slice(0, 5).forEach(pattern => {
          suggestions.push({
            query: pattern,
            count: 0,
            isComplete: false
          });
        });
      }
    }

    return suggestions.slice(0, 8);
  }
}
