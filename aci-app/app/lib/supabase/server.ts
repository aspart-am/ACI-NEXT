import { createClient } from '@supabase/supabase-js';

// Crée une instance Supabase pour les composants serveur
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 