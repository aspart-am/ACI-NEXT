'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { getAssociesActifs, getProjetsActifs, getChargesTotales, getRevenusTotaux, getParametresRepartitionActifs } from "@/app/lib/supabase/db";
import { useEffect, useState } from "react";
import { Associe, ParametresRepartition } from "@/app/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RepartitionGraph } from "@/app/components/RepartitionGraph";
import { calculerRepartitionSupabase } from "@/app/services/repartition";

export default function DashboardPage() {
  // États pour stocker les données
  const [associes, setAssocies] = useState<Associe[]>([]);
  const [projetsActifs, setProjetsActifs] = useState<any[]>([]);
  const [totalRevenus, setTotalRevenus] = useState<number>(0);
  const [totalCharges, setTotalCharges] = useState<number>(0);
  const [revenuNet, setRevenuNet] = useState<number>(0);
  const [parametres, setParametres] = useState<ParametresRepartition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resultatRepartition, setResultatRepartition] = useState<any[]>([]);

  // Fonction pour formater un montant en euros
  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  // Charger les données au chargement du composant
  useEffect(() => {
    async function loadData() {
      try {
        console.log("DashboardPage: Chargement des données...");
        
        // Récupération des données depuis Supabase
        try {
          console.log("DashboardPage: Récupération des associés...");
          const associesData = await getAssociesActifs();
          console.log("DashboardPage: Associés récupérés:", associesData.length);
          setAssocies(associesData);
        } catch (err) {
          console.error("DashboardPage: Erreur lors de la récupération des associés:", err);
        }
        
        try {
          console.log("DashboardPage: Récupération des projets actifs...");
          const projetsData = await getProjetsActifs();
          console.log("DashboardPage: Projets actifs récupérés:", projetsData.length);
          setProjetsActifs(projetsData);
        } catch (err) {
          console.error("DashboardPage: Erreur lors de la récupération des projets actifs:", err);
        }
        
        try {
          console.log("DashboardPage: Récupération des revenus...");
          const revenus = await getRevenusTotaux();
          console.log("DashboardPage: Revenus récupérés:", revenus);
          setTotalRevenus(revenus);
        } catch (err) {
          console.error("DashboardPage: Erreur lors de la récupération des revenus:", err);
        }
        
        try {
          console.log("DashboardPage: Récupération des charges...");
          const charges = await getChargesTotales();
          console.log("DashboardPage: Charges récupérées:", charges);
          setTotalCharges(charges);
        } catch (err) {
          console.error("DashboardPage: Erreur lors de la récupération des charges:", err);
        }
        
        try {
          console.log("DashboardPage: Récupération des paramètres...");
          const parametresData = await getParametresRepartitionActifs();
          console.log("DashboardPage: Paramètres récupérés:", parametresData ? "OK" : "NON");
          setParametres(parametresData);
        } catch (err) {
          console.error("DashboardPage: Erreur lors de la récupération des paramètres:", err);
        }

        try {
          console.log("DashboardPage: Calcul de la répartition...");
          const resultatData = await calculerRepartitionSupabase();
          console.log("DashboardPage: Répartition calculée, nombre de résultats:", resultatData.length);
          setResultatRepartition(resultatData);
        } catch (err) {
          console.error("DashboardPage: Erreur lors du calcul de la répartition:", err);
        }
        
        console.log("DashboardPage: Données chargées avec succès");
      } catch (error) {
        console.error('Erreur générale lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculer le revenu net à chaque changement de revenus ou charges
  useEffect(() => {
    setRevenuNet(totalRevenus - totalCharges);
  }, [totalRevenus, totalCharges]);

  // Préparer les données pour le graphique de répartition par métier
  const repartitionMetiers = associes.reduce((acc, associe) => {
    const metier = associe.description_metier || 'Non spécifié';
    acc[metier] = (acc[metier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dataMetiers = Object.entries(repartitionMetiers).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenue dans l'application de gestion ACI pour votre Maison de Santé Pluriprofessionnelle
        </p>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p>Chargement du tableau de bord...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Graphique de répartition des revenus */}
          {resultatRepartition.length > 0 && (
            <div className="mb-6">
              <RepartitionGraph resultats={resultatRepartition} />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Carte de répartition par métier */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par métier</CardTitle>
                <CardDescription>
                  Distribution des associés par profession
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataMetiers}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dataMetiers.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Carte des paramètres de répartition */}
            <Card>
              <CardHeader>
                <CardTitle>Critères de répartition</CardTitle>
                <CardDescription>
                  Distribution des revenus selon la formule configurée
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parametres ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Fixe', value: parametres.pourcentage_fixe },
                            { name: 'Réunions', value: parametres.pourcentage_reunions },
                            { name: 'Projets', value: parametres.pourcentage_projets }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Fixe', value: parametres.pourcentage_fixe },
                            { name: 'Réunions', value: parametres.pourcentage_reunions },
                            { name: 'Projets', value: parametres.pourcentage_projets }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Aucun paramètre configuré
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Paramètres de répartition */}
          <Card>
            <CardHeader>
              <CardTitle>Revenus et charges</CardTitle>
              <CardDescription>
                Aperçu financier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenus bruts:</span>
                  <span className="text-sm font-medium">{formatMontant(totalRevenus)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Charges totales:</span>
                  <span className="text-sm font-medium">{formatMontant(totalCharges)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-bold">Revenu net:</span>
                  <span className="text-sm font-bold">{formatMontant(revenuNet)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 