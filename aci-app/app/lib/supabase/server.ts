import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { CookieOptions } from '@supabase/ssr';
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Crée une instance Supabase pour les composants serveur
export function createServerSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const allCookies = cookies().getAll();
          const cookie = allCookies.find((cookie: RequestCookie) => cookie.name === name);
          return cookie?.value ?? '';
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, _options: CookieOptions) {
          cookies().delete(name);
        },
      },
    }
  );
} 