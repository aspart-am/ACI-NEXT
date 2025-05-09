'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/app/lib/supabase/client';
import { Session } from '@supabase/supabase-js';

interface TestResult {
  associes: {
    success: boolean;
    count: number;
    data: any[];
  };
  revenus: {
    success: boolean;
    count: number;
    data: any[];
  };
  parametres: {
    success: boolean;
    count: number;
    data: any[];
    error: string | null;
  };
}

export default function AuthDebugPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoadingSession(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
        console.log('Session data:', data);
      } catch (err: unknown) {
        console.error('Erreur de session:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoadingSession(false);
      }
    }
    
    checkAuth();
  }, []);

  const testDatabase = async () => {
    try {
      setLoadingTest(true);
      setError(null);
      
      // Test de lecture de la table associes
      const { data: associes, error: associesError } = await supabase
        .from('associes')
        .select('*')
        .limit(5);
      
      if (associesError) {
        throw new Error(`Erreur lors de la lecture des associés: ${associesError.message}`);
      }
      
      // Test de lecture de la table revenus_bruts
      const { data: revenus, error: revenusError } = await supabase
        .from('revenus_bruts')
        .select('*')
        .limit(3);
      
      if (revenusError) {
        throw new Error(`Erreur lors de la lecture des revenus: ${revenusError.message}`);
      }
      
      // Test de lecture de la table parametres_repartition
      const { data: parametres, error: parametresError } = await supabase
        .from('parametres_repartition')
        .select('*')
        .eq('actif', true);
      
      // Capture l'erreur mais ne bloque pas le test
      const parametresErrMsg = parametresError 
        ? `Erreur: ${parametresError.code} - ${parametresError.message}` 
        : null;
      
      // Préparer le résultat des tests
      setTestResult({
        associes: {
          success: true,
          count: associes?.length || 0,
          data: associes || []
        },
        revenus: {
          success: true,
          count: revenus?.length || 0,
          data: revenus || []
        },
        parametres: {
          success: !parametresError,
          count: parametres?.length || 0,
          data: parametres || [],
          error: parametresErrMsg
        }
      });
      
    } catch (err: unknown) {
      console.error('Erreur de test:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setTestResult(null);
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Débogage d'authentification</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>État d'authentification</CardTitle>
          <CardDescription>
            Informations sur votre session actuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSession ? (
            <p>Chargement de la session...</p>
          ) : session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-bold">✅ Authentifié</p>
              <p>User ID: {session.user.id}</p>
              <p>Email: {session.user.email}</p>
              <p>Expiration: {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Non définie'}</p>
            </div>
          ) : (
            <p className="text-red-500 font-bold">❌ Non authentifié</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Test d'accès à la base de données</CardTitle>
          <CardDescription>
            Vérifier si vous pouvez accéder aux données avec les politiques RLS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button 
            onClick={testDatabase}
            className="px-4 py-2 bg-primary text-white rounded-md mb-4"
            disabled={loadingTest}
          >
            {loadingTest ? 'Test en cours...' : 'Tester l\'accès à la base de données'}
          </button>
          
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 mb-4">
              {error}
            </div>
          )}
          
          {testResult && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold">Table associes:</h3>
                <p>Nombre d'enregistrements: {testResult.associes.count}</p>
                {testResult.associes.count > 0 && (
                  <pre className="p-2 bg-gray-100 rounded-md text-xs overflow-x-auto mt-2">
                    {JSON.stringify(testResult.associes.data, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <h3 className="font-bold">Table revenus_bruts:</h3>
                <p>Nombre d'enregistrements: {testResult.revenus.count}</p>
                {testResult.revenus.count > 0 && (
                  <pre className="p-2 bg-gray-100 rounded-md text-xs overflow-x-auto mt-2">
                    {JSON.stringify(testResult.revenus.data, null, 2)}
                  </pre>
                )}
              </div>
              
              <div>
                <h3 className="font-bold">Table parametres_repartition:</h3>
                {testResult.parametres.success ? (
                  <>
                    <p>Nombre d'enregistrements: {testResult.parametres.count}</p>
                    {testResult.parametres.count > 0 && (
                      <pre className="p-2 bg-gray-100 rounded-md text-xs overflow-x-auto mt-2">
                        {JSON.stringify(testResult.parametres.data, null, 2)}
                      </pre>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800 mt-2">
                    {testResult.parametres.error}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 