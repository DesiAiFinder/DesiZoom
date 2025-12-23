// Core types for the Desi Finder application

export interface Location {
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  address?: string;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  priceLevel?: number;
  photos?: string[];
  placeId: string;
  types: string[];
  distance?: number;
  businessStatus?: string;
  category: BusinessCategory;
}

export type BusinessCategory = 
  | 'grocery'
  | 'restaurant'
  | 'temple'
  | 'travel'
  | 'services'
  | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  venue: string;
  address: string;
  price?: string;
  link?: string;
  category: EventCategory;
  source: 'admin' | 'eventbrite';
  external_id?: string;
  is_active: boolean;
  created_by?: string; // User ID who created this event
  created_at: string;
  updated_at: string;
}

export type EventCategory = 
  | 'cultural'
  | 'religious'
  | 'social'
  | 'business'
  | 'educational'
  | 'other';

export interface Deal {
  id: string;
  title: string;
  description: string;
  category: DealCategory;
  price?: string;
  original_price?: string;
  discount?: string;
  valid_until?: string;
  link?: string;
  business?: string;
  is_active: boolean;
  created_by?: string; // User ID who created this deal
  created_at: string;
  updated_at: string;
}

export type DealCategory = 
  | 'food'
  | 'travel'
  | 'services'
  | 'shopping'
  | 'entertainment'
  | 'other';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  role?: 'admin' | 'service_provider';
  created_at: string;
  updated_at: string;
}

export interface LocalInfo {
  id: string;
  type: 'utility' | 'emergency' | 'government' | 'trash_recycling' | 'city_info';
  name: string;
  description?: string;
  phone?: string;
  website?: string;
  address?: string;
  subtype?: string;
  day?: string;
  time?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  category?: BusinessCategory;
  radius?: number;
  priceLevel?: number;
  rating?: number;
  openNow?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  location?: string;
  contact_info: string;
  images?: string[];
  is_active: boolean;
  deal_percentage?: number;
  original_price?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type ProductCategory = 
  | 'electronics'
  | 'clothing'
  | 'home_garden'
  | 'vehicles'
  | 'books'
  | 'sports'
  | 'beauty'
  | 'food'
  | 'services'
  | 'other';

export interface AdminStats {
  totalUsers: number;
  newUsersThisMonth: number;
  topLocations: { location: string; count: number }[];
  registrationTrends: { date: string; count: number }[];
}
