import { Howl } from 'howler';

export interface RadioBrowserStation {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  lastchangetime: string;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  lastchecktime: string;
  lastcheckoktime: string;
  lastlocalchecktime: string;
  clicktimestamp: string;
  clickcount: number;
  clicktrend: number;
}

export type SortOrder = 'clickcount' | 'votes' | 'name' | 'bitrate' | 'lastcheckoktime';
export type SortDirection = 'asc' | 'desc';

export interface RadioStation {
  id: string;
  name: string;
  description: string;
  streamUrl: string;
  fallbackUrls?: string[];
  logo?: string;
  genre: string;
  language: string;
  country: string;
  bitrate?: number;
  format: string;
  homepage?: string;
  tags?: string[];
  votes?: number;
  clickcount?: number;
  lastcheckok?: number;
  lastcheckoktime?: string;
}

export interface RadioPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  currentStation: RadioStation | null;
  volume: number;
  error: string | null;
  currentIndex: number;
  stations: RadioStation[];
  sortOrder: SortOrder;
  sortDirection: SortDirection;
  hideBroken: boolean;
  likedStations: string[];
}

class RadioBrowserService {
  private howl: Howl | null = null;
  private currentStation: RadioStation | null = null;
  private volume: number = 0.7;
  private listeners: ((state: RadioPlayerState) => void)[] = [];
  private stations: RadioStation[] = [];
  private currentIndex: number = 0;
  private countryCode: string = 'IN'; // Default to India
  private sortOrder: SortOrder = 'clickcount';
  private sortDirection: SortDirection = 'desc';
  private hideBroken: boolean = true;
  private likedStations: string[] = [];

  // Radio Browser API base URL
  private readonly API_BASE = 'https://de1.api.radio-browser.info';

  constructor() {
    this.initializeService();
    this.loadLikedStations();
  }

  private initializeService() {
    // Initialize with default settings
    console.log('Radio Browser Service initialized');
  }

  // Load liked stations from localStorage
  private loadLikedStations(): void {
    try {
      const stored = localStorage.getItem('radio-liked-stations');
      if (stored) {
        this.likedStations = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load liked stations:', error);
      this.likedStations = [];
    }
  }

  // Save liked stations to localStorage
  private saveLikedStations(): void {
    try {
      localStorage.setItem('radio-liked-stations', JSON.stringify(this.likedStations));
    } catch (error) {
      console.error('Failed to save liked stations:', error);
    }
  }

  // Toggle like status for a station
  public toggleLikeStation(stationId: string): void {
    const index = this.likedStations.indexOf(stationId);
    if (index > -1) {
      this.likedStations.splice(index, 1);
    } else {
      this.likedStations.push(stationId);
    }
    this.saveLikedStations();
    this.notifyListeners({
      isPlaying: this.howl ? this.howl.playing() : false,
      isLoading: false,
      currentStation: this.currentStation,
      volume: this.volume,
      error: null,
      currentIndex: this.currentIndex,
      stations: this.stations,
      sortOrder: this.sortOrder,
      sortDirection: this.sortDirection,
      hideBroken: this.hideBroken,
      likedStations: this.likedStations
    });
  }

  // Check if a station is liked
  public isStationLiked(stationId: string): boolean {
    return this.likedStations.includes(stationId);
  }

  // Get liked stations
  public getLikedStations(): string[] {
    return [...this.likedStations];
  }

  // Detect user's country based on location
  public async detectUserCountry(): Promise<string> {
    try {
      // Try to get location from browser
      if (navigator.geolocation) {
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                // Use reverse geocoding to get country code
                const response = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
                );
                const data = await response.json();
                const countryCode = data.countryCode || 'IN';
                resolve(countryCode);
              } catch (error) {
                console.log('Geocoding failed, using default country code');
                resolve('IN');
              }
            },
            () => {
              console.log('Geolocation failed, using default country code');
              resolve('IN');
            },
            { timeout: 5000 }
          );
        });
      }
    } catch (error) {
      console.log('Location detection failed, using default country code');
    }
    return 'IN'; // Default fallback to India
  }

  // Fetch stations from Radio Browser API by country
  public async fetchStationsByCountry(countryCode?: string): Promise<RadioStation[]> {
    try {
      const country = countryCode || this.countryCode;
      console.log(`Fetching stations for country: ${country}`);
      
      const response = await fetch(
        `${this.API_BASE}/json/stations/bycountrycodeexact/${country}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stations: ${response.status}`);
      }
      
      const data: RadioBrowserStation[] = await response.json();
      console.log(`Found ${data.length} stations for ${country}`);
      
      // Convert Radio Browser format to our format
      const stations: RadioStation[] = data
        .filter(station => {
          // Apply hideBroken filter
          if (this.hideBroken && station.lastcheckok !== 1) return false;
          return station.url_resolved;
        })
        .map(station => ({
          id: station.stationuuid,
          name: station.name,
          description: station.tags || station.name,
          streamUrl: station.url_resolved,
          logo: station.favicon || undefined,
          genre: this.extractGenreFromTags(station.tags),
          language: station.language || 'Unknown',
          country: station.country,
          bitrate: station.bitrate || undefined,
          format: station.codec || 'mp3',
          homepage: station.homepage || undefined,
          tags: station.tags ? station.tags.split(',').map(tag => tag.trim()) : [],
          votes: station.votes,
          clickcount: station.clickcount,
          lastcheckok: station.lastcheckok,
          lastcheckoktime: station.lastcheckoktime
        }))
        .sort((a, b) => this.sortStations(a, b))
        .slice(0, 100); // Limit to 100 stations for performance

      this.stations = stations;
      this.currentIndex = 0;
      
      this.notifyListeners({
        isPlaying: false,
        isLoading: false,
        currentStation: null,
        volume: this.volume,
        error: null,
        currentIndex: 0,
        stations: stations,
        sortOrder: this.sortOrder,
        sortDirection: this.sortDirection,
        hideBroken: this.hideBroken,
        likedStations: this.likedStations
      });

      return stations;
    } catch (error) {
      console.error('Error fetching stations:', error);
      this.notifyListeners({
        isPlaying: false,
        isLoading: false,
        currentStation: null,
        volume: this.volume,
        error: 'Failed to load radio stations. Please try again.',
        currentIndex: 0,
        stations: [],
        sortOrder: this.sortOrder,
        sortDirection: this.sortDirection,
        hideBroken: this.hideBroken,
        likedStations: this.likedStations
      });
      return [];
    }
  }

  // Sort stations based on current sort order and direction
  private sortStations(a: RadioStation, b: RadioStation): number {
    // First, prioritize liked stations
    const aIsLiked = this.likedStations.includes(a.id);
    const bIsLiked = this.likedStations.includes(b.id);
    
    if (aIsLiked && !bIsLiked) return -1;
    if (!aIsLiked && bIsLiked) return 1;
    
    // If both are liked or both are not liked, sort by the selected criteria
    let comparison = 0;
    
    switch (this.sortOrder) {
      case 'clickcount':
        comparison = (a.clickcount || 0) - (b.clickcount || 0);
        break;
      case 'votes':
        comparison = (a.votes || 0) - (b.votes || 0);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'bitrate':
        comparison = (a.bitrate || 0) - (b.bitrate || 0);
        break;
      case 'lastcheckoktime':
        comparison = new Date(a.lastcheckoktime || 0).getTime() - new Date(b.lastcheckoktime || 0).getTime();
        break;
      default:
        comparison = (a.clickcount || 0) - (b.clickcount || 0);
    }
    
    return this.sortDirection === 'desc' ? -comparison : comparison;
  }

  // Extract genre from tags
  private extractGenreFromTags(tags?: string): string {
    if (!tags) return 'Music';
    
    const tagArray = tags.toLowerCase().split(',');
    
    // Common genre mappings
    const genreMap: Record<string, string> = {
      'pop': 'Pop',
      'rock': 'Rock',
      'jazz': 'Jazz',
      'classical': 'Classical',
      'country': 'Country',
      'electronic': 'Electronic',
      'hip hop': 'Hip Hop',
      'r&b': 'R&B',
      'reggae': 'Reggae',
      'blues': 'Blues',
      'folk': 'Folk',
      'news': 'News',
      'talk': 'Talk',
      'sports': 'Sports',
      'comedy': 'Comedy',
      'religious': 'Religious',
      'indian': 'Indian',
      'bollywood': 'Bollywood',
      'hindi': 'Hindi',
      'telugu': 'Telugu',
      'tamil': 'Tamil',
      'bengali': 'Bengali',
      'punjabi': 'Punjabi',
      'gujarati': 'Gujarati',
      'marathi': 'Marathi',
      'kannada': 'Kannada',
      'malayalam': 'Malayalam',
      'urdu': 'Urdu',
      'arabic': 'Arabic',
      'chinese': 'Chinese',
      'japanese': 'Japanese',
      'korean': 'Korean',
      'thai': 'Thai',
      'vietnamese': 'Vietnamese',
      'indonesian': 'Indonesian',
      'malay': 'Malay',
      'filipino': 'Filipino',
      'spanish': 'Spanish',
      'portuguese': 'Portuguese',
      'french': 'French',
      'german': 'German',
      'italian': 'Italian',
      'russian': 'Russian',
      'english': 'English'
    };

    for (const tag of tagArray) {
      const trimmedTag = tag.trim();
      if (genreMap[trimmedTag]) {
        return genreMap[trimmedTag];
      }
    }

    return 'Music';
  }

  // Set sort order and refresh stations
  public async setSortOrder(order: SortOrder): Promise<void> {
    this.sortOrder = order;
    await this.refreshStations();
  }

  // Toggle sort direction and refresh stations
  public async toggleSortDirection(): Promise<void> {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    await this.refreshStations();
  }

  // Toggle hide broken stations and refresh stations
  public async toggleHideBroken(): Promise<void> {
    this.hideBroken = !this.hideBroken;
    await this.refreshStations();
  }

  // Refresh stations with current filters
  private async refreshStations(): Promise<void> {
    await this.fetchStationsByCountry(this.countryCode);
  }

  // Get available countries from Radio Browser API
  public async getAvailableCountries(): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_BASE}/json/countries`);
      const data = await response.json();
      return data.map((country: any) => country.name).sort();
    } catch (error) {
      console.error('Error fetching countries:', error);
      return ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'];
    }
  }

  // Get available languages from Radio Browser API
  public async getAvailableLanguages(): Promise<string[]> {
    try {
      const response = await fetch(`${this.API_BASE}/json/languages`);
      const data = await response.json();
      return data.map((lang: any) => lang.name).sort();
    } catch (error) {
      console.error('Error fetching languages:', error);
      return ['English', 'Hindi', 'Telugu', 'Tamil', 'Bengali', 'Spanish', 'French', 'German'];
    }
  }

  // Play a specific station
  public async playStation(station: RadioStation): Promise<void> {
    try {
      // If the same station is already playing and howl exists, toggle play/pause
      if (this.currentStation?.id === station.id && this.howl && this.howl.state() !== 'unloaded') {
        if (this.howl.playing()) {
          this.howl.pause();
        } else {
          this.howl.play();
        }
        return;
      }

      // Stop current playback completely first
      if (this.howl) {
        this.howl.off('stop');
        this.howl.off('play');
        this.howl.off('pause');
        this.howl.stop();
        this.howl.unload();
        this.howl = null;
      }

      // Set current station immediately to keep footer visible
      this.currentStation = station;
      this.currentIndex = this.stations.findIndex(s => s.id === station.id);

      // Start loading state
      this.notifyListeners({
        isPlaying: false,
        isLoading: true,
        currentStation: station,
        volume: this.volume,
        error: null,
        currentIndex: this.currentIndex,
        stations: this.stations,
        sortOrder: this.sortOrder,
        sortDirection: this.sortDirection,
        hideBroken: this.hideBroken,
        likedStations: this.likedStations
      });

      // Try to play the station
      await this.attemptPlayStation(station);

    } catch (error) {
      this.notifyListeners({
        isPlaying: false,
        isLoading: false,
        currentStation: station, // Keep the station visible even on error
        volume: this.volume,
        error: 'Failed to start radio stream. Please try again.',
        currentIndex: this.currentIndex,
        stations: this.stations,
        sortOrder: this.sortOrder,
        sortDirection: this.sortDirection,
        hideBroken: this.hideBroken,
        likedStations: this.likedStations
      });
    }
  }

  // Play next station
  public async playNext(): Promise<void> {
    if (this.stations.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.stations.length;
    const nextStation = this.stations[this.currentIndex];
    await this.playStation(nextStation);
  }

  // Play previous station
  public async playPrevious(): Promise<void> {
    if (this.stations.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.stations.length) % this.stations.length;
    const prevStation = this.stations[this.currentIndex];
    await this.playStation(prevStation);
  }

  private async attemptPlayStation(station: RadioStation): Promise<void> {
    // Create new Howl instance
    this.howl = new Howl({
      src: [station.streamUrl],
      html5: true,
      format: [station.format],
      volume: this.volume,
      onload: () => {
        // Automatically start playing when loaded
        this.howl?.play();
      },
      onloaderror: () => {
        console.error('Failed to load radio stream:', station.streamUrl);
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: station, // Keep the station visible even on error
          volume: this.volume,
          error: null,
          currentIndex: this.currentIndex,
          stations: this.stations,
          sortOrder: this.sortOrder,
          sortDirection: this.sortDirection,
          hideBroken: this.hideBroken,
          likedStations: this.likedStations
        });
      },
      onplay: () => {
        console.log('Successfully playing:', station.name);
        this.notifyListeners({
          isPlaying: true,
          isLoading: false,
          currentStation: station,
          volume: this.volume,
          error: null,
          currentIndex: this.currentIndex,
          stations: this.stations,
          sortOrder: this.sortOrder,
          sortDirection: this.sortDirection,
          hideBroken: this.hideBroken,
          likedStations: this.likedStations
        });
      },
      onpause: () => {
        this.notifyListeners({
          isPlaying: false,
          isLoading: false,
          currentStation: this.currentStation,
          volume: this.volume,
          error: null,
          currentIndex: this.currentIndex,
          stations: this.stations,
          sortOrder: this.sortOrder,
          sortDirection: this.sortDirection,
          hideBroken: this.hideBroken,
          likedStations: this.likedStations
        });
      },
      onstop: () => {
        // Only notify if we still have a currentStation (natural stop, not manual stop)
        // Don't clear if stop was called manually (currentStation would already be null)
        if (this.currentStation) {
          this.currentStation = null;
          this.notifyListeners({
            isPlaying: false,
            isLoading: false,
            currentStation: null,
            volume: this.volume,
            error: null,
            currentIndex: this.currentIndex,
            stations: this.stations,
            sortOrder: this.sortOrder,
            sortDirection: this.sortDirection,
            hideBroken: this.hideBroken,
            likedStations: this.likedStations
          });
        }
      }
    });

    // Play the stream immediately
    this.howl.play();
  }

  public pause(): void {
    if (this.howl) {
      this.howl.pause();
    }
  }

  public resume(): void {
    if (this.howl) {
      this.howl.play();
    }
  }

  public stop(): void {
    // Stop and unload the Howl instance first to prevent any callbacks
    if (this.howl) {
      this.howl.off('stop');
      this.howl.off('play');
      this.howl.off('pause');
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    
    // Clear currentStation immediately
    this.currentStation = null;
    
    // Notify listeners synchronously without startTransition for immediate UI update
    this.notifyListeners({
      isPlaying: false,
      isLoading: false,
      currentStation: null,
      volume: this.volume,
      error: null,
      currentIndex: this.currentIndex,
      stations: this.stations,
      sortOrder: this.sortOrder,
      sortDirection: this.sortDirection,
      hideBroken: this.hideBroken,
      likedStations: this.likedStations
    });
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.howl) {
      this.howl.volume(this.volume);
    }
    this.notifyListeners({
      isPlaying: this.howl ? this.howl.playing() : false,
      isLoading: false,
      currentStation: this.currentStation,
      volume: this.volume,
      error: null,
      currentIndex: this.currentIndex,
      stations: this.stations,
      sortOrder: this.sortOrder,
      sortDirection: this.sortDirection,
      hideBroken: this.hideBroken,
      likedStations: this.likedStations
    });
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentStation(): RadioStation | null {
    return this.currentStation;
  }

  public isPlaying(): boolean {
    return this.howl ? this.howl.playing() : false;
  }

  public getStations(): RadioStation[] {
    return [...this.stations];
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public subscribe(listener: (state: RadioPlayerState) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(state: RadioPlayerState): void {
    this.listeners.forEach(listener => listener(state));
  }

  public cleanup(): void {
    this.stop();
    this.listeners = [];
  }

  // Get current country code
  public getCountryCode(): string {
    return this.countryCode;
  }

  // Set country code and refresh stations
  public async setCountry(countryCode: string): Promise<void> {
    this.countryCode = countryCode;
    await this.fetchStationsByCountry(countryCode);
  }
}

// Export singleton instance
export const radioBrowserService = new RadioBrowserService();
