import { createClient } from '@supabase/supabase-js';

// Public client for frontend
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);
