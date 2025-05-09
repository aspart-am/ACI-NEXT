'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';

interface MigrationResult {
  success: boolean;
  message?: string;
  error?: Error;
}

export default function MigrationPage() {
  const [serviceKey, setServiceKey] = useState('');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Script de migration SQL
  const sqlMigration = `
-- Migration pour configurer le RLS sur toutes les tables
-- Activer RLS sur toutes les tables principales et créer des politiques permissives

-- ===== TABLE ASSOCIES =====
ALTER TABLE public.associes ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.associes;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.associes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE REVENUS_BRUTS =====
ALTER TABLE public.revenus_bruts ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.revenus_bruts;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.revenus_bruts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE CHARGES =====
ALTER TABLE public.charges ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.charges;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.charges
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE PARAMETRES_REPARTITION =====
ALTER TABLE public.parametres_repartition ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.parametres_repartition;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.parametres_repartition
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE PROJETS =====
ALTER TABLE public.projets ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.projets;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.projets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE PARTICIPATIONS_PROJETS =====
ALTER TABLE public.participations_projets ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.participations_projets;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.participations_projets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE HISTORIQUE_REPARTITIONS =====
-- Mise à jour des politiques pour rendre cette table accessible
ALTER TABLE public.historique_repartitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent lire les historiques" ON public.historique_repartitions;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.historique_repartitions;

CREATE POLICY "Allow all operations for authenticated users" ON public.historique_repartitions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ===== TABLE DETAILS_REPARTITION =====
ALTER TABLE public.details_repartition ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les doublons
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.details_repartition;

-- Créer une politique qui permet toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON public.details_repartition
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
  `;

  const executeSQL = async () => {
    if (!serviceKey.trim()) {
      setError('Veuillez entrer une clé de service valide');
      return;
    }

    try {
      setExecuting(true);
      setError(null);
      setResult(null);

      // Créer un client Supabase avec la clé de service
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey.trim()
      );

      // Exécuter le script SQL
      const { data, error } = await supabase.rpc('pgexec', {
        query: sqlMigration
      });

      if (error) throw error;

      console.log('Résultat migration:', data);
      setResult({
        success: true,
        message: 'Migration exécutée avec succès'
      });

      // Stocker la clé de service dans localStorage pour le débogage
      localStorage.setItem('debug_service_role_key', serviceKey.trim());

    } catch (err: unknown) {
      console.error('Erreur lors de l\'exécution de la migration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'exécution de la migration';
      setError(errorMessage);
      setResult({
        success: false,
        error: err instanceof Error ? err : new Error(errorMessage)
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Exécuter la migration RLS</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Migration SQL pour configurer le RLS</CardTitle>
          <CardDescription>
            Exécute le script SQL pour configurer correctement le RLS sur toutes les tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="serviceKey" className="block text-sm font-medium mb-1">
                Clé de service Supabase (service_role key)
              </label>
              <input
                id="serviceKey"
                type="password"
                value={serviceKey}
                onChange={(e) => setServiceKey(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Entrez votre clé de service Supabase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cette clé est nécessaire pour exécuter les commandes SQL directement. 
                Vous pouvez la trouver dans les paramètres de projet Supabase sous "API".
              </p>
            </div>
            
            <button
              onClick={executeSQL}
              disabled={executing || !serviceKey.trim()}
              className="px-4 py-2 bg-primary text-white rounded-md disabled:opacity-50"
            >
              {executing ? 'Exécution en cours...' : 'Exécuter la migration'}
            </button>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
                {error}
              </div>
            )}
            
            {result && result.success && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-md text-green-800">
                {result.message}
              </div>
            )}
          </div>
          
          <div className="mt-8">
            <h3 className="font-bold mb-2">SQL qui sera exécuté:</h3>
            <pre className="p-3 bg-gray-100 rounded-md text-xs overflow-x-auto">
              {sqlMigration}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 