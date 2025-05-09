'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@supabase/ssr';
import { Session } from '@supabase/supabase-js';

interface TestResult {
  associes: { data: unknown[]; error: string | null };
  revenus: { data: unknown[]; error: string | null };
  parametres: { data: unknown[]; error: string | null };
}

export default function AuthDebugPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSession(session);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testDatabase = async () => {
    try {
      setTestResult(null);
      setError(null);

      // Test accès à la table associes
      const { data: associesData, error: associesError } = await supabase
        .from('associes')
        .select('*')
        .limit(1);

      // Test accès à la table revenus
      const { data: revenusData, error: revenusError } = await supabase
        .from('revenus')
        .select('*')
        .limit(1);

      // Test accès à la table parametres_repartition
      const { data: parametresData, error: parametresError } = await supabase
        .from('parametres_repartition')
        .select('*')
        .limit(1);

      setTestResult({
        associes: { data: associesData || [], error: associesError?.message || null },
        revenus: { data: revenusData || [], error: revenusError?.message || null },
        parametres: { data: parametresData || [], error: parametresError?.message || null }
      });
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Debug Auth</h1>
        <p className="text-muted-foreground mt-2">
          Page de test pour vérifier l'authentification et l'accès à la base de données
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>
            Informations sur la session actuelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-2">
              <p>Connecté en tant que : {session.user.email}</p>
              <p>Expire le : {new Date(session.expires_at!).toLocaleString()}</p>
            </div>
          ) : (
            <p>Non connecté</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Base de données</CardTitle>
          <CardDescription>
            Vérifier l'accès aux tables principales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDatabase}>
            Tester l'accès
          </Button>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {testResult && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Table associes</h3>
                {testResult.associes.error ? (
                  <p className="text-red-600">{testResult.associes.error}</p>
                ) : (
                  <p className="text-green-600">Accès OK</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Table revenus</h3>
                {testResult.revenus.error ? (
                  <p className="text-red-600">{testResult.revenus.error}</p>
                ) : (
                  <p className="text-green-600">Accès OK</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Table parametres_repartition</h3>
                {testResult.parametres.error ? (
                  <p className="text-red-600">{testResult.parametres.error}</p>
                ) : (
                  <p className="text-green-600">Accès OK</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 