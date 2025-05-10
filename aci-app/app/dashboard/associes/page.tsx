'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getAllAssocies, getAssociesActifs, deleteAssocie } from "@/app/lib/supabase/db";
import { Associe } from "@/app/types";
import { AssocieForm } from "@/app/components/associes/AssocieForm";

// Mapping des libellés pour l'affichage
const LIBELLES_METIER: Record<string, string> = {
  'medecin': 'Médecin',
  'infirmiere': 'Infirmière',
  'podologue': 'Podologue',
  'dentiste': 'Dentiste',
  'kinesitherapeute': 'Kinésithérapeute',
  'orthesiste': 'Orthésiste',
  'pharmacien': 'Pharmacien'
};

// Version client
export default function AssociesPage() {
  const [associes, setAssocies] = useState<Associe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAssocie, setSelectedAssocie] = useState<Associe | undefined>(undefined);
  const [afficherInactifs, setAfficherInactifs] = useState(false);

  // Charger les associés
  const loadAssocies = async () => {
    try {
      setLoading(true);
      console.log("AssociesPage (client) : Début du chargement des associés");
      
      // Test supplémentaire avec getAssociesActifs pour voir ce qu'il renvoie
      try {
        const associesActifs = await getAssociesActifs();
        console.log("AssociesPage (client) : Nombre d'associés actifs (fonction spécifique):", associesActifs.length);
      } catch (e) {
        console.error("AssociesPage (client) : Erreur lors de la récupération des associés actifs:", e);
      }
      
      // Utiliser getAllAssocies pour avoir tous les associés
      const data = await getAllAssocies();
      console.log("AssociesPage (client) : Associés récupérés, nombre total:", data.length);
      
      // Vérifier les flags actif
      const actifsCount = data.filter(a => a.actif === true).length;
      const inactifsCount = data.filter(a => a.actif !== true).length;
      console.log(`AssociesPage (client) : Associés actifs: ${actifsCount}, inactifs: ${inactifsCount}`);
      
      setAssocies(data);
    } catch (err) {
      console.error("Erreur lors du chargement des associés:", err);
      setError("Impossible de charger les associés");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssocies();
  }, []);

  // Filtrer les associés selon le statut actif/inactif
  const associesFiltres = afficherInactifs 
    ? associes 
    : associes.filter(associe => associe.actif);

  // Ouvrir le formulaire pour ajouter un associé
  const handleAjouterAssocie = () => {
    setSelectedAssocie(undefined);
    setIsFormOpen(true);
  };

  // Ouvrir le formulaire pour modifier un associé
  const handleModifierAssocie = (associe: Associe) => {
    setSelectedAssocie(associe);
    setIsFormOpen(true);
  };

  // Fermer le formulaire
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  // Gérer la sauvegarde réussie d'un associé
  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    loadAssocies();
  };

  // Gérer la suppression d'un associé
  const handleSupprimerAssocie = async (associe: Associe) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${associe.prenom} ${associe.nom} ?`)) {
      try {
        await deleteAssocie(associe.id);
        loadAssocies();
      } catch (err) {
        console.error("Erreur lors de la suppression de l'associé:", err);
        setError("Impossible de supprimer l'associé");
      }
    }
  };

  // Formater une date pour l'affichage
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Associés</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les associés de la SISA et leur statut
          </p>
        </div>
        <Button onClick={handleAjouterAssocie}>Ajouter un associé</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des associés</CardTitle>
            <CardDescription>
              Liste de tous les associés et leur statut dans la SISA
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={afficherInactifs} 
                onChange={(e) => setAfficherInactifs(e.target.checked)} 
                className="rounded"
              />
              Afficher les inactifs
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Chargement des associés...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : associesFiltres.length === 0 ? (
            <div className="text-center py-4">Aucun associé trouvé.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Co-gérant</TableHead>
                  <TableHead>Description métier</TableHead>
                  <TableHead>Date d'entrée</TableHead>
                  <TableHead>Date de sortie</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {associesFiltres.map((associe) => (
                  <TableRow key={associe.id}>
                    <TableCell className="font-medium">{associe.nom}</TableCell>
                    <TableCell>{associe.prenom}</TableCell>
                    <TableCell>{associe.est_co_gerant ? "Oui" : "Non"}</TableCell>
                    <TableCell>{LIBELLES_METIER[associe.description_metier]}</TableCell>
                    <TableCell>{formatDate(associe.date_entree)}</TableCell>
                    <TableCell>{formatDate(associe.date_sortie)}</TableCell>
                    <TableCell>{associe.actif ? "Actif" : "Inactif"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleModifierAssocie(associe)}>
                          Modifier
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleSupprimerAssocie(associe)}>
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

      {/* Dialogue pour le formulaire d'ajout/modification */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <AssocieForm 
            associe={selectedAssocie} 
            onSuccess={handleSaveSuccess} 
            onCancel={handleCloseForm} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 