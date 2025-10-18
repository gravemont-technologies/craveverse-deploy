// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Check if we have valid Supabase credentials
const hasValidSupabaseConfig = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-anon-key';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

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

// Client-side Supabase client
export const supabaseClient = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient() as any;

// Server-side Supabase client with service role
export const supabaseServer = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createMockClient() as any;

// Admin client for elevated permissions
export const supabaseAdmin = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createMockClient() as any;


