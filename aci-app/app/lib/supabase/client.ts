import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Log des valeurs pour débogage
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key (masquée):', supabaseAnonKey ? (supabaseAnonKey.substring(0, 5) + '...' + supabaseAnonKey.substring(supabaseAnonKey.length - 5)) : 'NON DÉFINIE');

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variables d\'environnement Supabase manquantes! Vérifiez votre fichier .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: (key) => {
        if (typeof window === 'undefined') {
          return null;
        }
        
        // Essayer localStorage d'abord
        const localValue = localStorage.getItem(key);
        if (localValue) return localValue;
        
        // Essayer les cookies ensuite
        const cookies = document.cookie.split(';')
          .map(cookie => cookie.trim())
          .find(cookie => cookie.startsWith(`${key}=`));
          
        return cookies ? cookies.split('=')[1] : null;
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') {
          return;
        }
        
        // Stocker dans localStorage
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('Erreur localStorage:', e);
        }
        
        // Stocker dans les cookies aussi pour plus de fiabilité
        const maxAge = 100 * 365 * 24 * 60 * 60; // longue durée
        document.cookie = `${key}=${value}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') {
          return;
        }
        
        // Supprimer de localStorage
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Erreur localStorage:', e);
        }
        
        // Supprimer des cookies
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; secure`;
      },
    },
    flowType: 'implicit'
  },
  global: {
    // Log des requêtes pour le débogage
    fetch: (url, params) => {
      console.log(`🔍 Supabase Request: ${params?.method || 'GET'} ${url}`);
      return fetch(url, params);
    }
  },
  db: {
    schema: 'public'
  }
});

// Pour le débogage uniquement (utilisez-le si nécessaire pendant le développement)
export const createServiceRoleClient = () => {
  // Vérifier si on est côté client avant de le créer
  if (typeof window === 'undefined') {
    return null; // Ne pas créer sur le serveur
  }
  
  // Obtenez la clé de service à partir du localStorage (stockée temporairement lors du débogage)
  const serviceRoleKey = localStorage.getItem('debug_service_role_key');
  
  if (!serviceRoleKey) {
    console.warn('Clé de service non disponible pour le débogage');
    return null;
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}; 