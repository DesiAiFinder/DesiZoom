import { supabase } from '../services/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    // @ts-ignore - data unused but error is used
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    
    console.log('Supabase connection test successful!');
    return {
      success: true,
      message: 'Supabase connection working'
    };
    
  } catch (err: any) {
    console.error('Supabase test error:', err);
    return {
      success: false,
      error: err.message || 'Unknown error'
    };
  }
};

export const testUsersTable = async () => {
  try {
    console.log('Testing users table...');
    
    // Test if users table exists and is accessible
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Users table test failed:', error);
      return {
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint
      };
    }
    
    console.log('Users table test successful!');
    return {
      success: true,
      message: 'Users table accessible',
      count: data?.length || 0
    };
    
  } catch (err: any) {
    console.error('Users table test error:', err);
    return {
      success: false,
      error: err.message || 'Unknown error'
    };
  }
};

