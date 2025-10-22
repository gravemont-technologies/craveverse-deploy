// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

// Client-side Supabase client
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey!);

// Admin client for elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!);


