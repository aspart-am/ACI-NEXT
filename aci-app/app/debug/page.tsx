import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugIndexPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Outils de Débogage ACI-MSP</h1>
      <p className="text-gray-500">
        Ces outils sont destinés aux développeurs et administrateurs pour résoudre les problèmes liés à l'application.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/debug/auth" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Débogage Authentification</CardTitle>
              <CardDescription>
                Vérifiez l'état de votre session et testez l'accès à la base de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Cet outil vous permet de vérifier si vous êtes correctement authentifié et si vous pouvez accéder aux données 
                protégées par le Row Level Security (RLS).
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/debug/auth/migration" className="block">
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Migration RLS</CardTitle>
              <CardDescription>
                Exécutez la migration SQL pour configurer le RLS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Cet outil vous permet d'exécuter directement le script SQL qui configure le RLS sur toutes les tables.
                Il nécessite une clé de service Supabase pour fonctionner.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <h2 className="text-lg font-semibold text-amber-800 mb-2">⚠️ Important</h2>
        <p className="text-amber-700">
          Ces outils sont destinés uniquement au développement et au débogage. Ils ne devraient pas être accessibles 
          en production. Assurez-vous de les supprimer ou de les sécuriser avant de déployer l'application.
        </p>
      </div>
    </div>
  );
} 