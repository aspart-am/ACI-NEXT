'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAllRevenus, getAllCharges, getRevenusTotaux, getChargesTotales, deleteRevenu, deleteCharge } from "@/app/lib/supabase/db";
import { RevenuBrut, Charge } from "@/app/types";
import { RevenuForm } from "@/app/components/revenus/RevenuForm";
import { ChargeForm } from "@/app/components/charges/ChargeForm";

export default function RevenusPage() {
  // États pour les données
  const [revenus, setRevenus] = useState<RevenuBrut[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [totalRevenus, setTotalRevenus] = useState(0);
  const [totalCharges, setTotalCharges] = useState(0);
  
  // États pour le chargement et les erreurs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les dialogues de formulaire
  const [isRevenuFormOpen, setIsRevenuFormOpen] = useState(false);
  const [isChargeFormOpen, setIsChargeFormOpen] = useState(false);
  const [selectedRevenu, setSelectedRevenu] = useState<RevenuBrut | undefined>(undefined);
  const [selectedCharge, setSelectedCharge] = useState<Charge | undefined>(undefined);

  // Chargement des données initiales
  const loadData = async () => {
    try {
      setLoading(true);
      const revenusData = await getAllRevenus();
      const chargesData = await getAllCharges();
      const revenusTotauxData = await getRevenusTotaux();
      const chargesTotalesData = await getChargesTotales();
      
      setRevenus(revenusData);
      setCharges(chargesData);
      setTotalRevenus(revenusTotauxData);
      setTotalCharges(chargesTotalesData);
      
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Impossible de charger les données financières");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gestionnaires pour les revenus
  const handleAddRevenu = () => {
    setSelectedRevenu(undefined);
    setIsRevenuFormOpen(true);
  };

  const handleEditRevenu = (revenu: RevenuBrut) => {
    setSelectedRevenu(revenu);
    setIsRevenuFormOpen(true);
  };

  const handleDeleteRevenu = async (revenu: RevenuBrut) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      try {
        await deleteRevenu(revenu.id);
        loadData();
      } catch (err) {
        console.error("Erreur lors de la suppression du revenu:", err);
        setError("Impossible de supprimer le revenu");
      }
    }
  };

  const handleRevenuSuccess = () => {
    setIsRevenuFormOpen(false);
    loadData();
  };

  // Gestionnaires pour les charges
  const handleAddCharge = () => {
    setSelectedCharge(undefined);
    setIsChargeFormOpen(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setIsChargeFormOpen(true);
  };

  const handleDeleteCharge = async (charge: Charge) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette charge ?')) {
      try {
        await deleteCharge(charge.id);
        loadData();
      } catch (err) {
        console.error("Erreur lors de la suppression de la charge:", err);
        setError("Impossible de supprimer la charge");
      }
    }
  };

  const handleChargeSuccess = () => {
    setIsChargeFormOpen(false);
    loadData();
  };

  // Calcul du revenu net
  const revenuNet = totalRevenus - totalCharges;

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonction pour formater un montant en euros
  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Revenus</h1>
        <p className="text-muted-foreground mt-2">
          Gérez les revenus bruts et les charges pour calculer le revenu net à répartir
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Revenus bruts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMontant(totalRevenus)}</div>
          </CardContent>
        </Card>
        
        <Card className="h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMontant(totalCharges)}</div>
          </CardContent>
        </Card>
        
        <Card className="h-[120px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Revenus nets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatMontant(revenuNet)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Liste des revenus</CardTitle>
            <Button onClick={handleAddRevenu}>Ajouter un revenu</Button>
          </div>
          
          <Card className="min-h-[400px]">
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-4">Chargement des revenus...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : revenus.length === 0 ? (
                <div className="text-center py-4">Aucun revenu enregistré.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-[120px]">Montant</TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenus.map((revenu) => (
                      <TableRow key={revenu.id}>
                        <TableCell className="font-medium">{formatDate(revenu.date)}</TableCell>
                        <TableCell>{revenu.description}</TableCell>
                        <TableCell className="text-right font-medium">{formatMontant(revenu.montant)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRevenu(revenu)}>
                              Modifier
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteRevenu(revenu)}>
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Liste des charges</CardTitle>
            <Button onClick={handleAddCharge}>Ajouter une charge</Button>
          </div>
          
          <Card className="min-h-[400px]">
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-4">Chargement des charges...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">{error}</div>
              ) : charges.length === 0 ? (
                <div className="text-center py-4">Aucune charge enregistrée.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[150px]">Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right w-[120px]">Montant</TableHead>
                      <TableHead className="w-[200px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map((charge) => (
                      <TableRow key={charge.id}>
                        <TableCell className="font-medium">{formatDate(charge.date)}</TableCell>
                        <TableCell>{charge.categorie}</TableCell>
                        <TableCell>{charge.description}</TableCell>
                        <TableCell className="text-right font-medium">{formatMontant(charge.montant)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditCharge(charge)}>
                              Modifier
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteCharge(charge)}>
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogue pour le formulaire d'ajout/modification de revenu */}
      <Dialog open={isRevenuFormOpen} onOpenChange={setIsRevenuFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <RevenuForm 
            revenu={selectedRevenu} 
            onSuccess={handleRevenuSuccess} 
            onCancel={() => setIsRevenuFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialogue pour le formulaire d'ajout/modification de charge */}
      <Dialog open={isChargeFormOpen} onOpenChange={setIsChargeFormOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <ChargeForm 
            charge={selectedCharge} 
            onSuccess={handleChargeSuccess} 
            onCancel={() => setIsChargeFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 