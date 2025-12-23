// Environment configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://evkzwytixuatyhgidgpf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2a3p3eXRpeHVhdHloZ2lkZ3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODc2OTksImV4cCI6MjA3NTA2MzY5OX0.k89amsoKKGob1isGBKdZBuFAxtjZ1akwyZLYyG1SiQM',
    serviceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''
  },
  googlePlaces: {
    apiKey: import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyANE1GPMeSt0buIiMkV1_3tqNbBRWCq8OI'
  },
  admin: {
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'Supaadmin@123'
  },
  app: {
    name: 'Desi Finder',
    description: 'Your one-stop shop for all Desi needs',
    defaultLocation: {
      lat: 40.7128,
      lng: -74.0060,
      city: 'New York',
      state: 'NY'
    },
    searchRadius: 10 // miles
  }
}
