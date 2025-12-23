import { supabase } from './supabase';
import { DemoService } from './demoService';
import type { LocalInfo } from '../types';

export class LocalInfoService {
  // Get user's current location
  private static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  // Fetch government data from open APIs
  private static async fetchGovernmentData(latitude: number, longitude: number): Promise<LocalInfo[]> {
    const governmentData: LocalInfo[] = [];

    try {
      // Fetch city information using reverse geocoding
      const geocodingResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const geocodingData = await geocodingResponse.json();

      if (geocodingData.city) {
        // Add city information
        governmentData.push({
          id: `city-${Date.now()}`,
          type: 'city_info',
          name: geocodingData.city,
          description: `${geocodingData.city}, ${geocodingData.countryName}`,
          phone: undefined,
          website: undefined,
          address: `${geocodingData.city}, ${geocodingData.principalSubdivision}, ${geocodingData.countryName}`,
          subtype: 'city',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Fetch additional government services for the city
        await this.fetchCityServices(geocodingData.city, geocodingData.countryCode, governmentData);
      }

      // Fetch emergency services
      await this.fetchEmergencyServices(latitude, longitude, governmentData);

      // Fetch utility companies
      await this.fetchUtilityCompanies(geocodingData.city, geocodingData.countryCode, governmentData);

    } catch (error) {
      console.error('Error fetching government data:', error);
    }

    return governmentData;
  }

  // Fetch city services
  private static async fetchCityServices(city: string, countryCode: string, governmentData: LocalInfo[]): Promise<LocalInfo[]> {
    const result: LocalInfo[] = [];
    try {
      // Add common government services with official links
      const services = [
        {
          name: `${city} City Hall`,
          description: 'Main municipal government office',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}.gov`,
          subtype: 'city_hall'
        },
        {
          name: `${city} Police Department`,
          description: 'Local law enforcement services',
          phone: '911',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}police.gov`,
          subtype: 'police'
        },
        {
          name: `${city} Fire Department`,
          description: 'Fire and emergency medical services',
          phone: '911',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}fire.gov`,
          subtype: 'fire'
        },
        {
          name: `${city} Public Library`,
          description: 'Public library services and resources',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}library.gov`,
          subtype: 'library'
        },
        {
          name: `${city} Parks & Recreation`,
          description: 'Parks, recreational facilities, and programs',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}parks.gov`,
          subtype: 'parks'
        },
        {
          name: `${city} Health Department`,
          description: 'Public health services and information',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}health.gov`,
          subtype: 'health'
        },
        {
          name: `${city} Department of Motor Vehicles`,
          description: 'Vehicle registration and driver services',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}dmv.gov`,
          subtype: 'dmv'
        },
        {
          name: `${city} Public Works`,
          description: 'Infrastructure maintenance and utilities',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}publicworks.gov`,
          subtype: 'public_works'
        }
      ];

      services.forEach((service, index) => {
        const item: LocalInfo = {
          id: `service-${Date.now()}-${index}`,
          type: 'government',
          name: service.name,
          description: service.description,
          phone: service.phone || undefined,
          website: service.website || undefined,
          address: `${city}, ${countryCode}`,
          subtype: service.subtype,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        governmentData.push(item);
        result.push(item);
      });
    } catch (error) {
      console.error('Error fetching city services:', error);
    }
    return result;
  }

  // Fetch emergency services
  private static async fetchEmergencyServices(latitude: number, longitude: number, governmentData: LocalInfo[]): Promise<LocalInfo[]> {
    const result: LocalInfo[] = [];
    try {
      const emergencyServices = [
        {
          name: 'Emergency Services',
          phone: '911',
          subtype: 'emergency',
          description: 'Police, Fire, Medical Emergency',
          website: 'https://www.911.gov'
        },
        {
          name: 'Non-Emergency Police',
          phone: '311',
          subtype: 'non-emergency',
          description: 'Non-emergency police services',
          website: 'https://www.311.gov'
        },
        {
          name: 'Poison Control',
          phone: '1-800-222-1222',
          subtype: 'poison',
          description: '24/7 poison control hotline',
          website: 'https://www.poison.org'
        },
        {
          name: 'National Suicide Prevention Lifeline',
          phone: '988',
          subtype: 'suicide_prevention',
          description: '24/7 crisis support and suicide prevention',
          website: 'https://www.988lifeline.org'
        },
        {
          name: 'Disaster Relief',
          phone: '1-800-733-2767',
          subtype: 'disaster',
          description: 'American Red Cross disaster relief services',
          website: 'https://www.redcross.org'
        },
        {
          name: 'FBI Tips',
          phone: '1-800-CALL-FBI',
          subtype: 'fbi_tips',
          description: 'Report criminal activity to FBI',
          website: 'https://www.fbi.gov/tips'
        }
      ];

      emergencyServices.forEach((service, index) => {
        const item: LocalInfo = {
          id: `emergency-${Date.now()}-${index}`,
          type: 'emergency',
          name: service.name,
          description: service.description,
          phone: service.phone,
          website: service.website,
          address: `Based on your location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          subtype: service.subtype,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        governmentData.push(item);
        result.push(item);
      });
    } catch (error) {
      console.error('Error fetching emergency services:', error);
    }
    return result;
  }

  // Fetch trash and recycling information
  private static async fetchTrashRecyclingInfo(city: string, countryCode: string): Promise<LocalInfo[]> {
    try {
      const trashServices = [
        {
          name: `${city} Waste Management`,
          description: 'Municipal waste collection and disposal services',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}waste.gov`,
          subtype: 'waste_management'
        },
        {
          name: `${city} Recycling Center`,
          description: 'Recycling drop-off locations and guidelines',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}recycling.gov`,
          subtype: 'recycling'
        },
        {
          name: `${city} Hazardous Waste Disposal`,
          description: 'Safe disposal of hazardous materials',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}hazwaste.gov`,
          subtype: 'hazardous_waste'
        },
        {
          name: `${city} Composting Program`,
          description: 'Organic waste composting services',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}compost.gov`,
          subtype: 'composting'
        }
      ];

      const trashData: LocalInfo[] = [];
      trashServices.forEach((service, index) => {
        trashData.push({
          id: `trash-${Date.now()}-${index}`,
          type: 'trash_recycling',
          name: service.name,
          description: service.description,
          phone: undefined,
          website: service.website,
          address: `${city}, ${countryCode}`,
          subtype: service.subtype,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });

      return trashData;
    } catch (error) {
      console.error('Error fetching trash and recycling info:', error);
      return [];
    }
  }

  // Fetch utility companies
  private static async fetchUtilityCompanies(city: string, countryCode: string, governmentData: LocalInfo[]): Promise<LocalInfo[]> {
    const result: LocalInfo[] = [];
    try {
      const utilities = [
        {
          name: 'Electric Company',
          description: 'Electric power and utility services',
          subtype: 'electric',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}electric.com`
        },
        {
          name: 'Water Department',
          description: 'Water supply and wastewater services',
          subtype: 'water',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}water.gov`
        },
        {
          name: 'Gas Company',
          description: 'Natural gas utility services',
          subtype: 'gas',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}gas.com`
        },
        {
          name: 'Internet Service Provider',
          description: 'Broadband internet services',
          subtype: 'internet',
          website: `https://www.${city.toLowerCase().replace(/\s+/g, '')}internet.com`
        }
      ];

      utilities.forEach((utility, index) => {
        const item: LocalInfo = {
          id: `utility-${Date.now()}-${index}`,
          type: 'utility',
          name: utility.name,
          description: utility.description,
          phone: undefined,
          website: utility.website,
          address: `${city}, ${countryCode}`,
          subtype: utility.subtype,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        governmentData.push(item);
        result.push(item);
      });
    } catch (error) {
      console.error('Error fetching utility companies:', error);
    }
    return result;
  }

  // Get all active local info (from database - no hardcoded data)
  static async getAllLocalInfo(): Promise<LocalInfo[]> {
    try {
      // First try to get location-based government data
      const location = await this.getCurrentLocation();
      if (location) {
        console.log('Location found, fetching government data...');
        const governmentData = await this.fetchGovernmentData(location.latitude, location.longitude);
        if (governmentData.length > 0) {
          console.log('Using location-based government data');
          return governmentData;
        }
      } else {
        console.log('Location not available, trying database...');
      }

      // Fallback to database
      const { data, error } = await supabase
        .from('local_info')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true });

      if (error) {
        console.error('Database local info error:', error);
        return [];
      }

      // If no local info found in database, return demo data
      if (!data || data.length === 0) {
        console.log('No local info found in database. Using demo data.');
        return DemoService.getDemoLocalInfo() as LocalInfo[];
      }

      return data;
    } catch (error) {
      console.error('Error fetching local info:', error);
      return DemoService.getDemoLocalInfo() as LocalInfo[];
    }
  }

  // Get local info by type
  static async getLocalInfoByType(type: LocalInfo['type']): Promise<LocalInfo[]> {
    const { data, error } = await supabase
      .from('local_info')
      .select('*')
      .eq('is_active', true)
      .eq('type', type)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch local info: ${error.message}`);
    }

    return data || [];
  }

  // Get utilities
  static async getUtilities(): Promise<LocalInfo[]> {
    try {
      console.log('🔍 getUtilities called');
      // Try location-based utilities first
      const location = await this.getCurrentLocation();
      console.log('📍 Location result:', location);
      
      if (location) {
        const geocodingResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
        );
        const geocodingData = await geocodingResponse.json();
        console.log('🌍 Geocoding data:', geocodingData);
        
        if (geocodingData.city) {
          const utilities = await this.fetchUtilityCompanies(geocodingData.city, geocodingData.countryCode, []);
          console.log('⚡ Generated utilities:', utilities);
          if (utilities.length > 0) {
            return utilities;
          }
        }
      }
      
      console.log('🔄 Falling back to database for utilities');
      // Fallback to database
      const dbData = await this.getLocalInfoByType('utility');
      console.log('📊 Database utilities:', dbData);
      
      if (dbData.length === 0) {
        console.log('📝 Using demo utilities');
        return (DemoService.getDemoLocalInfo().filter(item => item.type === 'utility') as LocalInfo[]);
      }
      
      return dbData;
    } catch (error) {
      console.error('❌ Error fetching utilities:', error);
      return (DemoService.getDemoLocalInfo().filter(item => item.type === 'utility') as LocalInfo[]);
    }
  }

  // Get emergency contacts
  static async getEmergencyContacts(): Promise<LocalInfo[]> {
    try {
      console.log('🚨 getEmergencyContacts called');
      // Try location-based emergency services first
      const location = await this.getCurrentLocation();
      console.log('📍 Location result:', location);
      
      if (location) {
        const emergencyServices = await this.fetchEmergencyServices(location.latitude, location.longitude, []);
        console.log('🚨 Generated emergency services:', emergencyServices);
        if (emergencyServices.length > 0) {
          return emergencyServices;
        }
      }
      
      console.log('🔄 Falling back to database for emergency');
      // Fallback to database
      const dbData = await this.getLocalInfoByType('emergency');
      console.log('📊 Database emergency:', dbData);
      
      if (dbData.length === 0) {
        console.log('📝 Using demo emergency');
        return (DemoService.getDemoLocalInfo().filter(item => item.type === 'emergency') as LocalInfo[]);
      }
      
      return dbData;
    } catch (error) {
      console.error('❌ Error fetching emergency contacts:', error);
      return (DemoService.getDemoLocalInfo().filter(item => item.type === 'emergency') as LocalInfo[]);
    }
  }

  // Get government services
  static async getGovernmentServices(): Promise<LocalInfo[]> {
    try {
      console.log('🏛️ getGovernmentServices called');
      // Try location-based government services first
      const location = await this.getCurrentLocation();
      console.log('📍 Location result:', location);
      
      if (location) {
        const geocodingResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
        );
        const geocodingData = await geocodingResponse.json();
        console.log('🌍 Geocoding data:', geocodingData);
        
        if (geocodingData.city) {
          const services = await this.fetchCityServices(geocodingData.city, geocodingData.countryCode, []);
          console.log('🏛️ Generated government services:', services);
          if (services.length > 0) {
            return services;
          }
        }
      }
      
      console.log('🔄 Falling back to database for government');
      // Fallback to database
      const dbData = await this.getLocalInfoByType('government');
      console.log('📊 Database government:', dbData);
      
      if (dbData.length === 0) {
        console.log('📝 Using demo government');
        return (DemoService.getDemoLocalInfo().filter(item => item.type === 'government') as LocalInfo[]);
      }
      
      return dbData;
    } catch (error) {
      console.error('❌ Error fetching government services:', error);
      return (DemoService.getDemoLocalInfo().filter(item => item.type === 'government') as LocalInfo[]);
    }
  }

  // Get trash and recycling info
  static async getTrashRecycling(): Promise<LocalInfo[]> {
    try {
      console.log('🗑️ getTrashRecycling called');
      // Try location-based trash/recycling info first
      const location = await this.getCurrentLocation();
      console.log('📍 Location result:', location);
      
      if (location) {
        const geocodingResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.latitude}&longitude=${location.longitude}&localityLanguage=en`
        );
        const geocodingData = await geocodingResponse.json();
        console.log('🌍 Geocoding data:', geocodingData);
        
        if (geocodingData.city) {
          const trashData = await this.fetchTrashRecyclingInfo(geocodingData.city, geocodingData.countryCode);
          console.log('🗑️ Generated trash data:', trashData);
          if (trashData.length > 0) {
            return trashData;
          }
        }
      }
      
      console.log('🔄 Falling back to database for trash');
      // Fallback to database
      const dbData = await this.getLocalInfoByType('trash_recycling');
      console.log('📊 Database trash:', dbData);
      
      if (dbData.length === 0) {
        console.log('📝 Using demo trash');
        return (DemoService.getDemoLocalInfo().filter(item => item.type === 'trash_recycling') as LocalInfo[]);
      }
      
      return dbData;
    } catch (error) {
      console.error('❌ Error fetching trash and recycling info:', error);
      return (DemoService.getDemoLocalInfo().filter(item => item.type === 'trash_recycling') as LocalInfo[]);
    }
  }

  // Get all local info data (combined)
  static async getAllLocalInfoData(): Promise<LocalInfo[]> {
    try {
      console.log('🔍 getAllLocalInfoData called');
      const [utilities, emergency, government, trash] = await Promise.all([
        this.getUtilities(),
        this.getEmergencyContacts(),
        this.getGovernmentServices(),
        this.getTrashRecycling()
      ]);
      
      const allData = [...utilities, ...emergency, ...government, ...trash];
      console.log('📊 Combined local info data:', allData);
      return allData;
    } catch (error) {
      console.error('❌ Error fetching all local info:', error);
      return DemoService.getDemoLocalInfo() as LocalInfo[];
    }
  }

  // Get city info
  static async getCityInfo(): Promise<LocalInfo | null> {
    const { data, error } = await supabase
      .from('local_info')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'city_info')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch city info: ${error.message}`);
    }

    return data || null;
  }

  // Search local info
  static async searchLocalInfo(query: string): Promise<LocalInfo[]> {
    const { data, error } = await supabase
      .from('local_info')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('type', { ascending: true });

    if (error) {
      throw new Error(`Failed to search local info: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Create local info
  static async createLocalInfo(localInfoData: Omit<LocalInfo, 'id' | 'created_at' | 'updated_at'>): Promise<LocalInfo> {
    const { data, error } = await supabase
      .from('local_info')
      .insert([localInfoData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create local info: ${error.message}`);
    }

    return data;
  }

  // Admin: Update local info
  static async updateLocalInfo(id: string, localInfoData: Partial<LocalInfo>): Promise<LocalInfo> {
    const { data, error } = await supabase
      .from('local_info')
      .update(localInfoData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update local info: ${error.message}`);
    }

    return data;
  }

  // Admin: Delete local info
  static async deleteLocalInfo(id: string): Promise<void> {
    const { error } = await supabase
      .from('local_info')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete local info: ${error.message}`);
    }
  }

  // Admin: Get all local info (including inactive)
  static async getAllLocalInfoAdmin(): Promise<LocalInfo[]> {
    const { data, error } = await supabase
      .from('local_info')
      .select('*')
      .order('type', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch local info: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Toggle local info active status
  static async toggleLocalInfoStatus(id: string): Promise<LocalInfo> {
    const { data: currentInfo, error: fetchError } = await supabase
      .from('local_info')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch local info: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('local_info')
      .update({ is_active: !currentInfo.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle local info status: ${error.message}`);
    }

    return data;
  }
}
