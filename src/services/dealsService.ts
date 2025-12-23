import { supabase } from './supabase';
import { SupabaseAdminService } from './supabaseAdmin';
import { DemoService } from './demoService';
import type { Deal, DealCategory } from '../types';

export class DealsService {
  // Get all active deals (from database - no hardcoded data)
  static async getAllDeals(): Promise<Deal[]> {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database deals error:', error);
        return [];
      }

      // If no deals found in database, return demo data
      if (!data || data.length === 0) {
        console.log('No deals found in database. Using demo data.');
        return DemoService.getDemoDeals() as Deal[];
      }

      return data;
    } catch (error) {
      console.error('Error fetching deals:', error);
      return DemoService.getDemoDeals() as Deal[];
    }
  }

  // Get deals by category
  static async getDealsByCategory(category: DealCategory): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return data || [];
  }

  // Search deals
  static async searchDeals(query: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,business.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search deals: ${error.message}`);
    }

    return data || [];
  }

  // Get active deals (not expired)
  static async getActiveDeals(): Promise<Deal[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active deals: ${error.message}`);
    }

    return data || [];
  }

  // Get featured deals (recent and active)
  static async getFeaturedDeals(limit: number = 3): Promise<Deal[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('is_active', true)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch featured deals: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Create deal
  static async createDeal(dealData: Omit<Deal, 'id' | 'created_at' | 'updated_at'>): Promise<Deal> {
    try {
      // Try with regular client first
      const { data, error } = await supabase
        .from('deals')
        .insert([dealData])
        .select()
        .single();

      if (error) {
        console.error('Deal creation error:', error);
        
        // If RLS policy blocks the insert, try with admin client
        if (error.code === '42501' || error.message.includes('row-level security')) {
          console.log('RLS policy blocked insert, trying with admin client...');
          try {
            return await SupabaseAdminService.createDeal(dealData);
          } catch (adminError) {
            console.error('Admin client also failed:', adminError);
            throw new Error(`Failed to create deal: RLS policy violation. Please run the SQL fix in Supabase. Error: ${error.message}`);
          }
        }
        throw new Error(`Failed to create deal: ${error.message}`);
      }

      return data;
    } catch (error) {
      // If admin client also fails, throw the error
      throw error;
    }
  }

  // Admin: Update deal
  static async updateDeal(id: string, dealData: Partial<Deal>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update(dealData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update deal: ${error.message}`);
    }

    return data;
  }

  // Admin: Delete deal
  static async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete deal: ${error.message}`);
    }
  }

  // Admin: Get all deals (including inactive)
  static async getAllDealsAdmin(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch deals: ${error.message}`);
    }

    return data || [];
  }

  // Admin: Toggle deal active status
  static async toggleDealStatus(id: string): Promise<Deal> {
    const { data: currentDeal, error: fetchError } = await supabase
      .from('deals')
      .select('is_active')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch deal: ${fetchError.message}`);
    }

    const { data, error } = await supabase
      .from('deals')
      .update({ is_active: !currentDeal.is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to toggle deal status: ${error.message}`);
    }

    return data;
  }
}
