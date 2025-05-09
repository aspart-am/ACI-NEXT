'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getParametresRepartitionActifs, getRevenuNet } from "@/app/lib/supabase/db";
import { calculerRepartitionSupabase } from "@/app/services/repartition";
import { RepartitionGraph } from "@/app/components/RepartitionGraph";
import { SaveRepartitionButton } from "@/app/components/SaveRepartitionButton";
import { AlertCircle } from "lucide-react";
import { ResultatRepartition, ParametresRepartition } from "@/app/types";
import { useEffect, useState } from "react";

export default function RepartitionPage() {
  // États pour stocker les données
  const [parametres, setParametres] = useState<ParametresRepartition | null>(null);
  const [revenuNet, setRevenuNet] = useState<number>(0);
  const [resultatRepartition, setResultatRepartition] = useState<ResultatRepartition[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les données au chargement du composant
  useEffect(() => {
    async function loadData() {
      try {
        console.log("RepartitionPage: Début du chargement des données");
        
        // Tentative de récupération des données
        try {
          console.log("RepartitionPage: Récupération des paramètres...");
          const parametresData = await getParametresRepartitionActifs();
          console.log("RepartitionPage: Paramètres récupérés:", parametresData ? "OK" : "NON (null)");
          setParametres(parametresData);
        } catch (err) {
          console.error("RepartitionPage: Erreur lors de la récupération des paramètres:", err);
        }
        
        try {
          console.log("RepartitionPage: Récupération du revenu net...");
          const revenuNetData = await getRevenuNet();
          console.log("RepartitionPage: Revenu net récupéré:", revenuNetData);
          setRevenuNet(revenuNetData);
        } catch (err) {
          console.error("RepartitionPage: Erreur lors de la récupération du revenu net:", err);
        }
        
        try {
          console.log("RepartitionPage: Calcul de la répartition...");
          const resultatData = await calculerRepartitionSupabase();
          console.log("RepartitionPage: Répartition calculée, nombre de résultats:", resultatData.length);
          setResultatRepartition(resultatData);
        } catch (err) {
          console.error("RepartitionPage: Erreur lors du calcul de la répartition:", err);
          setError("Impossible de calculer la répartition. Veuillez vérifier les données et réessayer.");
        }
        
      } catch (err) {
        console.error("RepartitionPage: Erreur générale lors du chargement des données:", err);
        setError("Impossible de charger les données de répartition. Veuillez vérifier votre connexion et réessayer.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Fonction pour obtenir les initiales
  const getInitiales = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`;
  };

  // Fonction pour formater un montant en euros
  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  // Fonction pour formater un pourcentage
  const formatPourcentage = (pourcentage: number) => {
    return `${pourcentage.toFixed(1)}%`;
  };

  // Si une erreur est survenue
  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle size={20} />
            Erreur de chargement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <div className="mt-4">
            <Button asChild>
              <a href="/dashboard">Retour au tableau de bord</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Répartition des Revenus</h1>
          <p className="text-muted-foreground mt-2">
            Chargement des données de répartition...
          </p>
        </div>
        <div className="text-center py-10">
          <p>Veuillez patienter pendant le calcul de la répartition</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Répartition des Revenus</h1>
          <p className="text-muted-foreground mt-2">
            Distribution des revenus selon la formule configurée
          </p>
        </div>
        {resultatRepartition.length > 0 && (
          <SaveRepartitionButton resultats={resultatRepartition} />
        )}
      </div>

      {/* Ajout du graphique de répartition */}
      {resultatRepartition.length > 0 && (
        <div className="mb-6">
          <RepartitionGraph resultats={resultatRepartition} />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de répartition actuels</CardTitle>
            <CardDescription>
              Ces paramètres déterminent comment les revenus nets sont distribués
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parametres ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Part fixe :</span>
                  <span className="font-medium">{parametres.pourcentage_fixe}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Part réunions :</span>
                  <span className="font-medium">{parametres.pourcentage_reunions}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Part projets :</span>
                  <span className="font-medium">{parametres.pourcentage_projets}%</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span>Coefficient co-gérant :</span>
                  <span className="font-medium">x{parametres.coefficient_co_gerant}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucun paramètre de répartition configuré.
              </p>
            )}
            <div className="pt-2">
              <Button size="sm" variant="outline" asChild>
                <a href="/dashboard/parametres">Modifier les paramètres</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
            <CardDescription>
              Synthèse des montants à distribuer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Revenus nets à répartir :</span>
                <span className="font-medium">{formatMontant(revenuNet)}</span>
              </div>
              <div className="flex justify-between">
                <span>Nombre d'associés :</span>
                <span className="font-medium">{resultatRepartition.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Date de calcul :</span>
                <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
            <div className="pt-2 flex space-x-2">
              <Button size="sm" variant="outline" disabled={resultatRepartition.length === 0}>
                Exporter les résultats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {resultatRepartition.length > 0 ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Répartition détaillée par associé</CardTitle>
              <CardDescription>
                Distribution détaillée des revenus nets selon les trois composantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Associé</TableHead>
                    <TableHead className="text-right">Part fixe</TableHead>
                    <TableHead className="text-right">Part réunions</TableHead>
                    <TableHead className="text-right">Part projets</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Pourcentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultatRepartition.map((resultat) => (
                    <TableRow key={resultat.associeId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {getInitiales(resultat.nom, resultat.prenom)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{resultat.nom} {resultat.prenom}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatMontant(resultat.partFixe)}</TableCell>
                      <TableCell className="text-right">{formatMontant(resultat.partReunions)}</TableCell>
                      <TableCell className="text-right">{formatMontant(resultat.partProjets)}</TableCell>
                      <TableCell className="text-right font-medium">{formatMontant(resultat.total)}</TableCell>
                      <TableCell className="text-right">{formatPourcentage(resultat.pourcentageTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition visuelle</CardTitle>
              <CardDescription>
                Visualisation de la distribution entre les associés
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resultatRepartition.map((resultat) => (
                <div key={resultat.associeId} className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span>{resultat.nom} {resultat.prenom}</span>
                    <span>{formatMontant(resultat.total)} ({formatPourcentage(resultat.pourcentageTotal)})</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${resultat.pourcentageTotal}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aucune donnée de répartition</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pour calculer la répartition des revenus, veuillez d'abord ajouter des associés, 
              des réunions et des projets, puis configurer les paramètres de répartition.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 