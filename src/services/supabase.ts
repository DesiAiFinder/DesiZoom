import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';
import type { User, AdminStats } from '../types';

const supabase = createClient(config.supabase.url, config.supabase.anonKey);

export class SupabaseService {
  // User registration
  static async registerUser(userData: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    return data;
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  // Get user statistics (admin only)
  static async getUserStats(): Promise<AdminStats> {
    // Get total users
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to get user count: ${countError.message}`);
    }

    // Get new users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: newUsersThisMonth, error: monthError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    if (monthError) {
      throw new Error(`Failed to get monthly users: ${monthError.message}`);
    }

    // Get top locations
    const { data: locationData, error: locationError } = await supabase
      .from('users')
      .select('location')
      .not('location', 'is', null);

    if (locationError) {
      throw new Error(`Failed to get location data: ${locationError.message}`);
    }

    const locationCounts = locationData?.reduce((acc, user) => {
      const location = user.location || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const topLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: trendData, error: trendError } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (trendError) {
      throw new Error(`Failed to get trend data: ${trendError.message}`);
    }

    const registrationTrends = trendData?.reduce((acc, user) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const trends = Object.entries(registrationTrends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalUsers: totalUsers || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
      topLocations,
      registrationTrends: trends
    };
  }

  // Search users (admin only)
  static async searchUsers(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,location.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return data || [];
  }

  // Delete user (admin only)
  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }
}

export { supabase };
