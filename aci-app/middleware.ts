import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('Middleware exécuté pour:', request.nextUrl.pathname);
  
  // Créer une réponse de base qu'on pourra modifier
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    // Création du client Supabase pour le middleware avec une gestion de cookies simplifiée
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            const cookie = request.cookies.get(name)?.value;
            console.log(`Lecture du cookie ${name}:`, cookie ? 'présent' : 'absent');
            return cookie;
          },
          set(name, value, options) {
            console.log(`Définition du cookie ${name}`);
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            console.log(`Suppression du cookie ${name}`);
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Récupération de la session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    console.log('Session détectée:', session ? 'Oui' : 'Non');

    // ================ GESTION DES REDIRECTIONS ================
    
    // Pages publiques qui sont toujours accessibles même sans authentification
    const publicPaths = ['/auth/login', '/auth/contact', '/'];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);
    
    // Si l'utilisateur est authentifié et tente d'accéder à une page publique, 
    // on le redirige vers le dashboard
    if (session && isPublicPath) {
      console.log('Redirection vers /dashboard (déjà authentifié)');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Si l'utilisateur n'est pas authentifié et tente d'accéder à une page protégée,
    // on le redirige vers la page de login
    if (!session && !isPublicPath && !request.nextUrl.pathname.startsWith('/auth')) {
      console.log('Redirection vers /auth/login (non authentifié)');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    console.log('Pas de redirection, poursuite de la requête');
    return response;
    
  } catch (error) {
    console.error('Erreur dans le middleware:', error);
    return response; // En cas d'erreur, on continue normalement
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 