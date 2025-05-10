import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Crée une instance Supabase pour les composants serveur
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Utiliser la méthode synchrone pour obtenir le cookie
          return cookieStore.get(name)?.value ?? '';
        },
        set() {
          // Dans un contexte serveur, on ne peut pas toujours modifier les cookies
          // Cette fonction n'est pas implémentée car les cookies sont en lecture seule
        },
        remove() {
          // Dans un contexte serveur, on ne peut pas toujours modifier les cookies
          // Cette fonction n'est pas implémentée car les cookies sont en lecture seule
        },
      },
    }
  );
}
