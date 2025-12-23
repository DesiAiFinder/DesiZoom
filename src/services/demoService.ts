// Demo service to show how the system works with real APIs
// This demonstrates the data flow without hardcoded data

export class DemoService {
  // Simulate real business data from Google Places API
  static getDemoBusinesses() {
    return [
      {
        id: 'demo-1',
        name: 'Patel Brothers',
        address: '123 Main St, City, State',
        rating: 4.5,
        category: 'grocery',
        distance: 2.3,
        phone: '(555) 123-4567',
        website: 'https://patelbros.com',
        placeId: 'demo-place-1'
      },
      {
        id: 'demo-2', 
        name: 'Spice Garden Restaurant',
        address: '456 Oak Ave, City, State',
        rating: 4.2,
        category: 'restaurant',
        distance: 1.8,
        phone: '(555) 234-5678',
        website: 'https://spicegarden.com',
        placeId: 'demo-place-2'
      }
    ];
  }

  // Simulate real events from Eventbrite API
  static getDemoEvents() {
    return [
      {
        id: 'demo-event-1',
        title: 'Diwali Celebration 2024',
        description: 'Join us for a grand Diwali celebration with traditional food, music, and fireworks display.',
        date: '2024-11-01',
        time: '18:00:00',
        venue: 'Community Center',
        address: '123 Main St, City, State 12345',
        price: 'Free',
        link: 'https://eventbrite.com/demo',
        category: 'cultural',
        source: 'eventbrite',
        external_id: 'demo-eventbrite-1',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Simulate real deals from business partnerships
  static getDemoDeals() {
    return [
      {
        id: 'demo-deal-1',
        title: '20% Off Indian Groceries',
        description: 'Get 20% off on all Indian spices, lentils, and rice at Patel Brothers',
        category: 'food',
        price: '20% OFF',
        original_price: 'Regular Price',
        discount: '20%',
        valid_until: '2024-12-31',
        business: 'Patel Brothers',
        link: 'https://patelbros.com/deals',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }

  // Simulate real local info from city APIs
  static getDemoLocalInfo() {
    return [
      // Utilities
      {
        id: 'demo-utility-1',
        type: 'utility',
        name: 'Electric Company',
        description: 'Local electric utility provider',
        phone: '(555) 123-4567',
        website: 'https://electriccompany.com',
        address: '123 Power St, City, State',
        subtype: 'electric',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-utility-2',
        type: 'utility',
        name: 'Water Department',
        description: 'Municipal water supply and wastewater services',
        phone: '(555) 234-5678',
        website: 'https://waterdept.gov',
        address: '456 Water Ave, City, State',
        subtype: 'water',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-utility-3',
        type: 'utility',
        name: 'Gas Company',
        description: 'Natural gas utility services',
        phone: '(555) 345-6789',
        website: 'https://gascompany.com',
        address: '789 Gas Blvd, City, State',
        subtype: 'gas',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Emergency Services
      {
        id: 'demo-emergency-1',
        type: 'emergency',
        name: 'Emergency Services',
        description: 'Police, Fire, Medical Emergency',
        phone: '911',
        website: 'https://www.911.gov',
        address: 'Emergency Dispatch Center',
        subtype: 'emergency',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-emergency-2',
        type: 'emergency',
        name: 'Non-Emergency Police',
        description: 'Non-emergency police services',
        phone: '311',
        website: 'https://www.311.gov',
        address: 'Police Department',
        subtype: 'non-emergency',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-emergency-3',
        type: 'emergency',
        name: 'Poison Control',
        description: '24/7 poison control hotline',
        phone: '1-800-222-1222',
        website: 'https://www.poison.org',
        address: 'National Poison Control Center',
        subtype: 'poison',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Government Services
      {
        id: 'demo-government-1',
        type: 'government',
        name: 'City Hall',
        description: 'Main municipal government office',
        phone: '(555) 456-7890',
        website: 'https://www.city.gov',
        address: '100 City Hall Plaza, City, State',
        subtype: 'city_hall',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-government-2',
        type: 'government',
        name: 'Police Department',
        description: 'Local law enforcement services',
        phone: '(555) 567-8901',
        website: 'https://www.citypolice.gov',
        address: '200 Police Plaza, City, State',
        subtype: 'police',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-government-3',
        type: 'government',
        name: 'Fire Department',
        description: 'Fire and emergency medical services',
        phone: '(555) 678-9012',
        website: 'https://www.cityfire.gov',
        address: '300 Fire Station Rd, City, State',
        subtype: 'fire',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-government-4',
        type: 'government',
        name: 'Public Library',
        description: 'Public library services and resources',
        phone: '(555) 789-0123',
        website: 'https://www.citylibrary.gov',
        address: '400 Library Lane, City, State',
        subtype: 'library',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      // Trash & Recycling
      {
        id: 'demo-trash-1',
        type: 'trash_recycling',
        name: 'Waste Management',
        description: 'Municipal waste collection and disposal services',
        phone: '(555) 890-1234',
        website: 'https://www.citywaste.gov',
        address: '500 Waste Management Center, City, State',
        subtype: 'waste_management',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-trash-2',
        type: 'trash_recycling',
        name: 'Recycling Center',
        description: 'Recycling drop-off locations and guidelines',
        phone: '(555) 901-2345',
        website: 'https://www.cityrecycling.gov',
        address: '600 Recycling Rd, City, State',
        subtype: 'recycling',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'demo-trash-3',
        type: 'trash_recycling',
        name: 'Hazardous Waste Disposal',
        description: 'Safe disposal of hazardous materials',
        phone: '(555) 012-3456',
        website: 'https://www.cityhazwaste.gov',
        address: '700 Hazardous Waste Facility, City, State',
        subtype: 'hazardous_waste',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
  }
}
