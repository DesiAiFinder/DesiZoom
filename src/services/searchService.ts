import { supabase } from './supabase';
import { GooglePlacesService } from './googlePlaces';
import type { Business, Product, Location } from '../types';

export interface SearchResult {
  type: 'marketplace' | 'place' | 'product';
  data: Product | Business;
  relevance: number;
}

export interface TrendingSearch {
  query: string;
  count: number;
}

export class SearchService {
  private static readonly TRENDING_SEARCHES_KEY = 'trending_searches';
  private static readonly RECENT_SEARCHES_KEY = 'recent_searches';
  private static readonly MAX_RECENT_SEARCHES = 10;

  // Save search to recent searches
  static saveSearch(query: string): void {
    try {
      // Only save meaningful queries (at least 3 characters)
      if (query.trim().length < 3) {
        return;
      }
      
      const recent = this.getRecentSearches();
      const updated = [query, ...recent.filter(s => s !== query)].slice(0, this.MAX_RECENT_SEARCHES);
      localStorage.setItem(this.RECENT_SEARCHES_KEY, JSON.stringify(updated));
      
      // Also update trending (simplified - in production, use backend)
      this.updateTrending(query);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }

  // Get recent searches
  static getRecentSearches(): string[] {
    try {
      const data = localStorage.getItem(this.RECENT_SEARCHES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  // Get trending searches (simplified - would normally come from backend)
  static getTrendingSearches(): TrendingSearch[] {
    try {
      const data = localStorage.getItem(this.TRENDING_SEARCHES_KEY);
      const trending = data ? JSON.parse(data) : {};
      
      // Filter out partial/incomplete queries and only keep meaningful ones
      const meaningfulQueries = Object.entries(trending)
        .filter(([query]) => {
          const trimmedQuery = query.trim();
          // Only keep queries that:
          // 1. Are at least 3 characters long
          // 2. Don't start with common partial words
          // 3. Contain meaningful content (not just single letters or common words)
          return trimmedQuery.length >= 3 && 
                 !this.isPartialQuery(trimmedQuery) &&
                 this.isMeaningfulQuery(trimmedQuery);
        })
        .map(([query, count]) => ({ query, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      return meaningfulQueries;
    } catch (error) {
      return [];
    }
  }

  // Check if a query is a partial/incomplete search
  private static isPartialQuery(query: string): boolean {
    const partialPatterns = [
      /^[a-z]$/, // Single letters
      /^[a-z]{1,2}$/, // 1-2 letter words
      /^(i|w|wa|wan|want|to|buy|a|as|an|the|and|or|but|in|on|at|for|of|with|by)$/i, // Common partial words
      /^(iphone|phone|car|laptop|book|shirt|shoes)$/i, // Single product words without context
      /^i\s+wan/, // "i wan" patterns
      /^i\s+want$/, // "i want" without continuation
      /^i\s+want\s+t$/, // "i want t" patterns
      /^i\s+want\s+to$/, // "i want to" without continuation
      /^i\s+want\s+to\s+b$/, // "i want to b" patterns
      /^i\s+want\s+to\s+bu$/, // "i want to bu" patterns
      /^i\s+want\s+to\s+buy$/, // "i want to buy" without continuation
      /^looking\s+for$/, // "looking for" without continuation
      /^need\s+to$/, // "need to" without continuation
      /^search\s+for$/, // "search for" without continuation
    ];
    
    return partialPatterns.some(pattern => pattern.test(query.trim()));
  }

  // Check if a query is meaningful and contains full context
  private static isMeaningfulQuery(query: string): boolean {
    const trimmedQuery = query.trim();
    
    // Must be at least 5 characters long for meaningful context
    if (trimmedQuery.length < 5) {
      return false;
    }
    
    // Must contain at least one meaningful word (not just articles/prepositions)
    const meaningfulWords = trimmedQuery.split(/\s+/).filter(word => 
      word.length > 2 && 
      !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'i', 'want', 'need', 'looking', 'search'].includes(word.toLowerCase())
    );
    
    // Must have at least 2 meaningful words for full context
    return meaningfulWords.length >= 2;
  }

  // Update trending searches
  private static updateTrending(query: string): void {
    try {
      // Only update trending for complete, meaningful queries
      if (query.trim().length < 3 || this.isPartialQuery(query) || !this.isMeaningfulQuery(query)) {
        return;
      }
      
      const data = localStorage.getItem(this.TRENDING_SEARCHES_KEY);
      const trending = data ? JSON.parse(data) : {};
      trending[query] = (trending[query] || 0) + 1;
      localStorage.setItem(this.TRENDING_SEARCHES_KEY, JSON.stringify(trending));
    } catch (error) {
      console.error('Error updating trending:', error);
    }
  }

  // Clear all partial/incomplete trending searches
  static clearPartialTrendingSearches(): void {
    try {
      const data = localStorage.getItem(this.TRENDING_SEARCHES_KEY);
      const trending = data ? JSON.parse(data) : {};
      
      // Filter out partial queries and keep only meaningful ones
      const meaningfulTrending: Record<string, number> = {};
      Object.entries(trending).forEach(([query, count]) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length >= 3 && 
            !this.isPartialQuery(trimmedQuery) && 
            this.isMeaningfulQuery(trimmedQuery)) {
          meaningfulTrending[trimmedQuery] = count as number;
        }
      });
      
      localStorage.setItem(this.TRENDING_SEARCHES_KEY, JSON.stringify(meaningfulTrending));
    } catch (error) {
      console.error('Error clearing partial trending searches:', error);
    }
  }

  // Force clear all trending searches (nuclear option)
  static forceClearAllTrendingSearches(): void {
    try {
      localStorage.removeItem(this.TRENDING_SEARCHES_KEY);
      localStorage.removeItem(this.RECENT_SEARCHES_KEY);
      console.log('All trending and recent searches cleared');
    } catch (error) {
      console.error('Error force clearing trending searches:', error);
    }
  }

  // Intelligent search across products, marketplace, and places
  // Prioritizes deals first, then places
  static async intelligentSearch(
    query: string,
    location: Location | null
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    // Parse the query to extract meaningful search terms
    const searchTerms = this.extractSearchTerms(query);
    console.log('🔍 Search terms extracted:', searchTerms);
    
    // Search marketplace products first (prioritize deals)
    if (query.trim().length >= 2) {
      try {
        // Build search conditions for each term
        const searchConditions = searchTerms.map(term => 
          `title.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%`
        ).join(',');
        
        const { data: products, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .or(searchConditions)
          .limit(20);

        if (!error && products) {
          // Filter products that match any of the search terms
          const filteredProducts = products.filter((product: Product) => 
            this.matchesSearchTerms(product, searchTerms)
          );
          
          // Separate deals and regular products
          const deals = filteredProducts.filter(product => 
            product.deal_percentage && product.deal_percentage > 0
          );
          const regularProducts = filteredProducts.filter(product => 
            !product.deal_percentage || product.deal_percentage <= 0
          );
          
          // Add deals first with higher relevance
          deals.forEach((product: Product) => {
            const relevance = this.calculateTokenRelevance(product, searchTerms) + 50; // Boost deals
            results.push({
              type: 'marketplace',
              data: product,
              relevance
            });
          });
          
          // Add regular products
          regularProducts.forEach((product: Product) => {
            const relevance = this.calculateTokenRelevance(product, searchTerms);
            results.push({
              type: 'marketplace',
              data: product,
              relevance
            });
          });
        }
      } catch (error) {
        console.error('Error searching products:', error);
      }
    }

    // Search places after products (lower priority)
    if (location && query.trim().length >= 3) {
      try {
        const places = await GooglePlacesService.searchIndianBusinesses(
          location,
          'other',
          16000,
          query
        );
        
        places.slice(0, 10).forEach((place: Business) => {
          const relevance = this.calculatePlaceRelevance(place, query) - 10; // Lower priority than products
          results.push({
            type: 'place',
            data: place,
            relevance
          });
        });
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }

    // Sort by relevance (deals will be first due to higher scores)
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Calculate relevance score for products
  // @ts-ignore - unused but kept for potential future use
  private static calculateRelevance(product: Product, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    if (product.title.toLowerCase().includes(lowerQuery)) score += 10;
    if (product.description.toLowerCase().includes(lowerQuery)) score += 5;
    if (product.category.toLowerCase().includes(lowerQuery)) score += 3;
    if (product.location?.toLowerCase().includes(lowerQuery)) score += 2;

    // Boost deals
    if (product.deal_percentage && product.deal_percentage > 0) score += 2;

    return score;
  }

  // Calculate relevance score for places
  private static calculatePlaceRelevance(place: Business, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 5; // Base score

    if (place.name.toLowerCase().includes(lowerQuery)) score += 10;
    if (place.address?.toLowerCase().includes(lowerQuery)) score += 3;

    // Boost by rating
    if (place.rating) score += place.rating;

    // Boost by distance (closer = better)
    if (place.distance) score += Math.max(0, 10 - place.distance);

    return score;
  }

  // Extract meaningful search terms from natural language queries
  private static extractSearchTerms(query: string): string[] {
    const lowerQuery = query.toLowerCase().trim();
    
    // Minimal stop words - only the most common words that don't add search value
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
      'it', 'me', 'him', 'us', 'them', 'we', 'you', 'he', 'she', 'they'
    ]);

    // Split by common delimiters and filter out only the most basic stop words
    const words = lowerQuery
      .split(/[\s,.-]+/)
      .filter(word => {
        // Keep words that are:
        // 1. Longer than 1 character
        // 2. Not in the minimal stop words list
        // 3. Not just numbers or special characters
        return word.length > 1 && 
               !stopWords.has(word) && 
               /[a-zA-Z]/.test(word); // Must contain at least one letter
      })
      .map(word => word.trim());

    // If no meaningful words found, use the original query
    if (words.length === 0) {
      return [lowerQuery];
    }

    // Add the original query as well for broader matching
    const terms = [...words];
    if (!terms.includes(lowerQuery)) {
      terms.push(lowerQuery);
    }

    // Remove duplicates and return
    return [...new Set(terms)];
  }

  // Check if a product matches any of the search terms
  private static matchesSearchTerms(product: Product, searchTerms: string[]): boolean {
    const searchableText = [
      product.title,
      product.description,
      product.category,
      product.location || '',
      product.condition
    ].join(' ').toLowerCase();

    return searchTerms.some(term => {
      const lowerTerm = term.toLowerCase();
      
      // Exact match
      if (searchableText.includes(lowerTerm)) {
        return true;
      }
      
      // Partial word match (for compound words)
      const words = searchableText.split(/\s+/);
      return words.some(word => 
        word.includes(lowerTerm) || lowerTerm.includes(word)
      );
    });
  }

  // Calculate relevance score based on search terms
  private static calculateTokenRelevance(product: Product, searchTerms: string[]): number {
    let score = 0;
    const title = product.title.toLowerCase();
    const description = product.description.toLowerCase();
    const category = product.category.toLowerCase();
    const location = (product.location || '').toLowerCase();
    const condition = product.condition.toLowerCase();

    // Score based on term matches with partial matching
    searchTerms.forEach(term => {
      const lowerTerm = term.toLowerCase();
      
      // Title matches (highest priority)
      if (title.includes(lowerTerm)) {
        score += 15;
        // Bonus for exact word matches in title
        if (title.split(/\s+/).includes(lowerTerm)) score += 5;
      } else if (title.split(/\s+/).some(word => 
        word.includes(lowerTerm) || lowerTerm.includes(word)
      )) {
        score += 10; // Partial match in title
      }
      
      // Description matches
      if (description.includes(lowerTerm)) {
        score += 10;
        if (description.split(/\s+/).includes(lowerTerm)) score += 3;
      } else if (description.split(/\s+/).some(word => 
        word.includes(lowerTerm) || lowerTerm.includes(word)
      )) {
        score += 6; // Partial match in description
      }
      
      // Category matches
      if (category.includes(lowerTerm)) {
        score += 8;
        if (category.split(/\s+/).includes(lowerTerm)) score += 2;
      } else if (category.split(/\s+/).some(word => 
        word.includes(lowerTerm) || lowerTerm.includes(word)
      )) {
        score += 4; // Partial match in category
      }
      
      // Location matches
      if (location.includes(lowerTerm)) {
        score += 5;
        if (location.split(/\s+/).includes(lowerTerm)) score += 2;
      } else if (location.split(/\s+/).some(word => 
        word.includes(lowerTerm) || lowerTerm.includes(word)
      )) {
        score += 2; // Partial match in location
      }
      
      // Condition matches
      if (condition.includes(lowerTerm)) {
        score += 3;
      }
    });

    // Boost for deals
    if (product.deal_percentage && product.deal_percentage > 0) score += 5;

    // Boost for newer products
    const daysSinceCreated = (Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated < 7) score += 3;
    else if (daysSinceCreated < 30) score += 1;

    return score;
  }
}

