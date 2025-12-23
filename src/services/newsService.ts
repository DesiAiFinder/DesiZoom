import type { Location } from '../types';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl?: string;
}

export class NewsService {
  // Using free RSS feeds and public news APIs that don't require API keys
  // Optimized for United States users
  private static readonly GOOGLE_NEWS_RSS = 'https://news.google.com/rss';
  
  // US State abbreviations to full names mapping (for better search queries)
  private static readonly US_STATES: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
    'DC': 'Washington DC'
  };

  /**
   * Get top local news headlines based on location
   * Optimized for United States users - uses current location for local news
   * Uses free RSS feeds - no API key required
   * Includes caching and multiple fallback strategies for reliability
   */
  static async getLocalNews(location: Location | null, limit: number = 3): Promise<NewsArticle[]> {
    try {
      // Check cache first
      const cachedNews = this.getCachedNews();
      if (cachedNews.length > 0) {
        console.log('📰 Using cached news');
        return cachedNews.slice(0, limit);
      }

      let articles: NewsArticle[] = [];

      // Strategy 1: Location-based news (if location available)
      if (location?.city || location?.state) {
        console.log('📰 Fetching location-based news for:', location);
        
        // Try city + state query first
        if (location.city && location.state) {
          articles = await this.fetchFromGoogleNewsRSS(location, limit, 'city-state');
          if (articles.length >= limit) {
            this.cacheNews(articles);
            return articles.slice(0, limit);
          }
        }

        // Try city only query
        if (location.city && articles.length < limit) {
          const cityArticles = await this.fetchFromGoogleNewsRSS(location, limit - articles.length, 'city');
          articles = [...articles, ...cityArticles];
          if (articles.length >= limit) {
            this.cacheNews(articles);
            return articles.slice(0, limit);
          }
        }

        // Try state only query
        if (location.state && articles.length < limit) {
          const stateArticles = await this.fetchFromGoogleNewsRSS(location, limit - articles.length, 'state');
          articles = [...articles, ...stateArticles];
        }
      }

      // Strategy 2: Try alternative news sources if Google News fails
      if (articles.length < limit) {
        console.log('📰 Trying alternative news sources');
        const alternativeArticles = await this.fetchFromAlternativeSources(limit - articles.length);
        articles = [...articles, ...alternativeArticles];
      }

      // Remove duplicates and filter
      const uniqueArticles = this.removeDuplicateArticles(articles);
      
      if (uniqueArticles.length > 0) {
        this.cacheNews(uniqueArticles);
        return uniqueArticles.slice(0, limit);
      }

      // Strategy 3: Fallback to US top stories
      console.log('📰 Falling back to top stories');
      const topStories = await this.fetchTopStories(limit);
      if (topStories.length > 0) {
        this.cacheNews(topStories);
        return topStories;
      }

      // Strategy 4: Return cached news even if expired
      const expiredCache = this.getCachedNews(true);
      if (expiredCache.length > 0) {
        console.log('📰 Using expired cache as last resort');
        return expiredCache.slice(0, limit);
      }

      // Final fallback: return empty array
      console.warn('📰 No news available from any source');
      return [];
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // Try to return cached news on error
      const cachedNews = this.getCachedNews(true);
      if (cachedNews.length > 0) {
        console.log('📰 Using cached news after error');
        return cachedNews.slice(0, limit);
      }
      
      return [];
    }
  }

  /**
   * Cache news articles in localStorage
   */
  private static cacheNews(articles: NewsArticle[]): void {
    try {
      const cacheData = {
        articles,
        timestamp: Date.now(),
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      };
      localStorage.setItem('desi_finder_news_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache news:', error);
    }
  }

  /**
   * Get cached news articles
   */
  private static getCachedNews(includeExpired: boolean = false): NewsArticle[] {
    try {
      const cached = localStorage.getItem('desi_finder_news_cache');
      if (!cached) return [];

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      if (!includeExpired && now > cacheData.expiresAt) {
        return [];
      }

      return cacheData.articles || [];
    } catch (error) {
      console.warn('Failed to get cached news:', error);
      return [];
    }
  }

  /**
   * Fetch from alternative news sources
   */
  private static async fetchFromAlternativeSources(limit: number): Promise<NewsArticle[]> {
    try {
      // Try BBC News RSS as alternative
      const bbcUrl = 'https://feeds.bbci.co.uk/news/rss.xml';
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(bbcUrl)}`;
      
      const response = await fetch(proxyUrl, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`BBC News RSS error: ${response.status}`);
      }
      
      const proxyData = await response.json();
      const rssContent = typeof proxyData.contents === 'string' 
        ? proxyData.contents 
        : JSON.stringify(proxyData);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rssContent, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const articles: NewsArticle[] = [];
      const maxItems = Math.min(items.length, limit);
      
      for (let i = 0; i < maxItems; i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        
        if (title && title !== 'No title') {
          articles.push({
            title: this.cleanHtmlEntities(title),
            description: this.cleanHtmlEntities(description).substring(0, 150).trim() || 'No description available',
            url: link,
            source: 'BBC News',
            publishedAt: pubDate,
            imageUrl: undefined
          });
        }
      }
      
      return articles;
    } catch (error) {
      console.error('Error fetching from alternative sources:', error);
      return [];
    }
  }

  /**
   * Remove duplicate articles based on title similarity
   */
  private static removeDuplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>();
    const unique: NewsArticle[] = [];

    for (const article of articles) {
      const normalizedTitle = article.title.toLowerCase().trim();
      if (!seen.has(normalizedTitle)) {
        seen.add(normalizedTitle);
        unique.push(article);
      }
    }

    return unique;
  }

  /**
   * Fetch news from Google News RSS feed with retry logic
   * Optimized for US locations - completely free, no API key required
   */
  private static async fetchFromGoogleNewsRSS(
    location: Location,
    limit: number,
    queryType: 'city-state' | 'city' | 'state' = 'city-state'
  ): Promise<NewsArticle[]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📰 Attempt ${attempt}/${maxRetries} - Fetching Google News RSS`);
        
        // Construct optimized search query for US locations
        let query = this.buildUSLocationQuery(location, queryType);

        // Google News RSS with search query optimized for US
        const rssUrl = `${this.GOOGLE_NEWS_RSS}/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; DesiFinder/1.0)'
          },
          // Add timeout
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
          throw new Error(`Google News RSS error: ${response.status} ${response.statusText}`);
        }
        
        const proxyData = await response.json();
        
        // Validate proxy response
        if (!proxyData.contents) {
          throw new Error('Invalid proxy response: no contents');
        }
        
        const rssContent = typeof proxyData.contents === 'string' 
          ? proxyData.contents 
          : JSON.stringify(proxyData.contents);
        
        // Parse RSS XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(rssContent, 'text/xml');
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror');
        if (parseError) {
          throw new Error('RSS parsing error: ' + parseError.textContent);
        }
        
        const items = xmlDoc.querySelectorAll('item');
        
        if (items.length === 0) {
          throw new Error('No news items found in RSS feed');
        }
        
        const articles: NewsArticle[] = [];
        const maxItems = Math.min(items.length, limit);
        
        for (let i = 0; i < maxItems; i++) {
          const item = items[i];
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '#';
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
          const source = item.querySelector('source')?.textContent || 'Google News';
          
          // Extract source name better (Google News format: "Source Name")
          const sourceName = source.split(' ')[0] || 'News';
          
          // Clean up description (remove HTML tags if present)
          const cleanDescription = description
            .replace(/<[^>]*>/g, '')
            .substring(0, 150)
            .trim() || 'No description available';
          
          articles.push({
            title: this.cleanHtmlEntities(title),
            description: cleanDescription,
            url: link,
            source: sourceName,
            publishedAt: pubDate,
            imageUrl: undefined
          });
        }
        
        const filteredArticles = articles.filter(article => 
          article.title !== 'No title' && 
          article.title.length > 0 &&
          !article.title.toLowerCase().includes('when you have more storage space') &&
          !article.title.toLowerCase().includes('error') &&
          !article.title.toLowerCase().includes('unavailable')
        );

        if (filteredArticles.length > 0) {
          console.log(`📰 Successfully fetched ${filteredArticles.length} articles from Google News`);
          return filteredArticles;
        } else {
          throw new Error('No valid articles found after filtering');
        }
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`📰 Attempt ${attempt}/${maxRetries} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          console.log(`📰 Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    console.error('📰 All attempts failed:', lastError);
    return [];
  }

  /**
   * Build optimized location query for US locations
   */
  private static buildUSLocationQuery(location: Location, queryType: 'city-state' | 'city' | 'state'): string {
    if (queryType === 'city-state' && location.city && location.state) {
      // Use full state name for better results
      const fullStateName = this.getFullStateName(location.state);
      return `${location.city} ${fullStateName} local news`;
    }
    
    if (queryType === 'city' && location.city) {
      return `${location.city} local news`;
    }
    
    if (queryType === 'state' && location.state) {
      const fullStateName = this.getFullStateName(location.state);
      return `${fullStateName} news`;
    }
    
    // Default fallback
    return 'United States news';
  }

  /**
   * Get full state name from abbreviation
   */
  private static getFullStateName(stateAbbr: string): string {
    const upperState = stateAbbr.toUpperCase().trim();
    return this.US_STATES[upperState] || stateAbbr;
  }

  /**
   * Clean HTML entities from text
   */
  private static cleanHtmlEntities(text: string): string {
    return text
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }

  /**
   * Fetch top stories from Google News (US-focused fallback)
   */
  private static async fetchTopStories(limit: number): Promise<NewsArticle[]> {
    try {
      // Google News US top stories RSS - optimized for US users
      const rssUrl = `${this.GOOGLE_NEWS_RSS}/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        return [];
      }
      
      const proxyData = await response.json();
      const rssContent = typeof proxyData.contents === 'string' 
        ? proxyData.contents 
        : JSON.stringify(proxyData);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rssContent, 'text/xml');
      const items = xmlDoc.querySelectorAll('item');
      
      const articles: NewsArticle[] = [];
      const maxItems = Math.min(items.length, limit);
      
      for (let i = 0; i < maxItems; i++) {
        const item = items[i];
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '#';
        const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString();
        const source = item.querySelector('source')?.textContent || 'Google News';
        
        const sourceName = source.split(' ')[0] || 'News';
        
        const cleanDescription = description
          .replace(/<[^>]*>/g, '')
          .substring(0, 150)
          .trim() || 'No description available';
        
        articles.push({
          title: this.cleanHtmlEntities(title),
          description: cleanDescription,
          url: link,
          source: sourceName,
          publishedAt: pubDate,
          imageUrl: undefined
        });
      }
      
      return articles.filter(article => 
        article.title !== 'No title' && 
        article.title.length > 0 &&
        !article.title.toLowerCase().includes('when you have more storage space')
      );
    } catch (error) {
      console.error('Error fetching top stories:', error);
      return [];
    }
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  static formatRelativeTime(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
    } catch (error) {
      return 'Recently';
    }
  }
}

