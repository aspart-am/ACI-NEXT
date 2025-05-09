'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { getAssociesActifs, getProjetsActifs, getChargesTotales, getRevenusTotaux, getParametresRepartitionActifs } from "@/app/lib/supabase/db";
import { useEffect, useState } from "react";
import { Associe, ParametresRepartition, Projet } from "@/app/types";

export default function DashboardPage() {
  // États pour stocker les données
  const [associes, setAssocies] = useState<Associe[]>([]);
  const [projetsActifs, setProjetsActifs] = useState<Projet[]>([]);
  const [totalRevenus, setTotalRevenus] = useState<number>(0);
  const [totalCharges, setTotalCharges] = useState<number>(0);
  const [revenuNet, setRevenuNet] = useState<number>(0);
  const [parametres, setParametres] = useState<ParametresRepartition | null>(null);
  const [coGerantsCount, setCoGerantsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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
          const coGerants = associesData.filter(associe => associe.est_co_gerant).length;
          setCoGerantsCount(coGerants);
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
        <Tabs defaultValue="apercu" className="space-y-4">
          <TabsList>
            <TabsTrigger value="apercu">Aperçu</TabsTrigger>
            <TabsTrigger value="participation">Participation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="apercu" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus nets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatMontant(revenuNet)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenus bruts - charges
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Associés actifs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{associes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dont {coGerantsCount} co-gérants
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projets en cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projetsActifs.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Projets actifs
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Revenus</CardTitle>
                  <CardDescription>
                    Détail des revenus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Revenus bruts:</span>
                      <span className="text-sm font-medium">{formatMontant(totalRevenus)}</span>
                    </div>
                    <div className="pt-2">
                      <Link href="/dashboard/revenus" className="text-sm text-primary hover:underline">
                        Gérer les revenus
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Charges</CardTitle>
                  <CardDescription>
                    Détail des charges
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Charges totales:</span>
                      <span className="text-sm font-medium">{formatMontant(totalCharges)}</span>
                    </div>
                    <div className="pt-2">
                      <Link href="/dashboard/charges" className="text-sm text-primary hover:underline">
                        Gérer les charges
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Prochaines réunions</CardTitle>
                  <CardDescription>
                    Les réunions à venir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Chargement des réunions...
                  </p>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Répartition actuelle</CardTitle>
                  <CardDescription>
                    Distribution selon la formule configurée
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {parametres ? (
                    <div className="space-y-1">
                      <div className="text-sm">{parametres.pourcentage_fixe}% fixe (majoration co-gérants)</div>
                      <div className="text-sm">{parametres.pourcentage_reunions}% réunions RCP</div>
                      <div className="text-sm">{parametres.pourcentage_projets}% projets</div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Aucun paramètre configuré
                    </div>
                  )}
                  <div className="pt-2">
                    <Link href="/dashboard/repartition" className="text-sm text-primary hover:underline">
                      Voir la répartition détaillée
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="participation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participation des associés</CardTitle>
                <CardDescription>
                  Implication dans les réunions et projets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {associes.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm">
                      {associes.length} associés actifs participant aux activités
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucune donnée disponible
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  <div>
                    <Link href="/dashboard/associes" className="text-sm text-primary hover:underline">
                      Gérer les associés
                    </Link>
                  </div>
                  <div>
                    <Link href="/dashboard/reunions" className="text-sm text-primary hover:underline">
                      Gérer les réunions
                    </Link>
                  </div>
                  <div>
                    <Link href="/dashboard/projets" className="text-sm text-primary hover:underline">
                      Gérer les projets
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 