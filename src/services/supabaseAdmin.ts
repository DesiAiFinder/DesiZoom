import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

// Create a Supabase client with service role key for admin operations
// This bypasses RLS policies and should be used only for admin operations
const supabaseAdmin = createClient(
  config.supabase.url, 
  config.supabase.serviceRoleKey || config.supabase.anonKey // Fallback to anon key if service role key not available
);

export class SupabaseAdminService {
  // Create event with admin privileges (bypasses RLS)
  static async createEvent(eventData: any) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }

    return data;
  }

  // Create deal with admin privileges (bypasses RLS)
  static async createDeal(dealData: any) {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .insert([dealData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create deal: ${error.message}`);
    }

    return data;
  }
}

export { supabaseAdmin };
