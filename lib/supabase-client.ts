// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Create mock client for development when credentials are not available
const createMockClient = () => ({
  from: () => ({
    select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ eq: () => ({ data: null, error: null }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }) }),
  }),
  auth: {
    getUser: () => ({ data: { user: null }, error: null }),
    signInWithPassword: () => ({ data: { user: null }, error: null }),
    signUp: () => ({ data: { user: null }, error: null }),
    signOut: () => ({ error: null }),
  },
});

// Safe client creation function
function createSafeClient(url: string, key: string) {
  try {
    if (!url || !key || url === 'https://placeholder.supabase.co' || key === 'placeholder-anon-key' || key === 'placeholder-service-key') {
      console.warn('Supabase: Using mock client due to missing/invalid credentials');
      console.warn(`Supabase URL: ${url}`);
      console.warn(`Supabase Key length: ${key?.length || 0}`);
      return createMockClient() as any;
    }
    
    const client = createClient(url, key);
    console.log('Supabase: Real client created successfully');
    return client;
  } catch (error) {
    console.error('Supabase client creation failed, using mock client:', error);
    return createMockClient() as any;
  }
}

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = 
  supabaseUrl && 
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey && 
  supabaseAnonKey !== 'placeholder-anon-key' &&
  supabaseServiceKey &&
  supabaseServiceKey !== 'placeholder-service-key';

// Client-side Supabase client
export const supabaseClient = createSafeClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role
export const supabaseServer = createSafeClient(supabaseUrl, supabaseServiceKey);

// Admin client for elevated permissions
export const supabaseAdmin = createSafeClient(supabaseUrl, supabaseServiceKey);

// Safe createClient function that handles missing environment variables
export function createSupabaseClient(url?: string, key?: string) {
  return createSafeClient(url || supabaseUrl, key || supabaseAnonKey);
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabaseServer
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Database connection test failed:', error);
      return { connected: false, error: error.message };
    }
    
    console.log('Database connection test successful');
    return { connected: true, error: null };
  } catch (error) {
    console.error('Database connection test exception:', error);
    return { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Export createClient for use in other files
export { createClient };