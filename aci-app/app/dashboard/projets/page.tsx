'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Edit, Archive, Eye, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllProjets, getProjetsActifs, getProjetsTermines, getParticipationsByProjetId, createProjet, updateProjet, terminerProjet, createParticipationProjet, updateParticipationProjet, getAssociesActifs } from "@/app/lib/supabase/db";
import { toast } from "@/components/ui/use-toast";
import { Associe, Projet, ParticipationProjet } from "@/app/types";

// Composant pour afficher les projets
export default function ProjetsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [projetsActifs, setProjetsActifs] = useState<Projet[]>([]);
  const [projetsTermines, setProjetsTermines] = useState<Projet[]>([]);
  const [associesActifs, setAssociesActifs] = useState<Associe[]>([]);
  const [participations, setParticipations] = useState<Record<string, ParticipationProjet[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nouveauPoids, setNouveauPoids] = useState("2");
  const [poidsModifie, setPoidsModifie] = useState("");
  const [nouveauProjet, setNouveauProjet] = useState<Partial<Projet>>({
    titre: "",
    description: "",
    poids: 2,
    date_debut: new Date().toISOString().split('T')[0],
    actif: true
  });
  const [nouvellesParticipations, setNouvellesParticipations] = useState<{associe_id: string, pourcentage_contribution: number}[]>([]);

  useEffect(() => {
    // Charger les données depuis la base de données
    const chargerDonnees = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Charger les associés actifs
        const associes = await getAssociesActifs();
        setAssociesActifs(associes);
        
        // Charger les projets actifs et terminés
        const projetActifs = await getProjetsActifs();
        const projetTermines = await getProjetsTermines();
        
        setProjetsActifs(projetActifs);
        setProjetsTermines(projetTermines);
        
        // Charger les participations pour chaque projet
        const tousLesProjets = [...projetActifs, ...projetTermines];
        const participationsParProjet: Record<string, ParticipationProjet[]> = {};
        
        for (const projet of tousLesProjets) {
          const participationsProjet = await getParticipationsByProjetId(projet.id);
          participationsParProjet[projet.id] = participationsProjet;
        }
        
        setParticipations(participationsParProjet);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setIsLoading(false);
      }
    };

    chargerDonnees();
  }, []);

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "En cours";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir les initiales
  const getInitiales = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`;
  };

  // Mettre à jour les informations du nouveau projet
  const handleChangeNouveauProjet = (field: keyof Projet, value: any) => {
    setNouveauProjet(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer la création d'un nouveau projet
  const handleCreateProjet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Vérifier que les pourcentages totalisent 100%
      const totalPourcentage = nouvellesParticipations.reduce(
        (sum, p) => sum + p.pourcentage_contribution, 
        0
      );
      
      if (totalPourcentage !== 100) {
        toast({
          title: "Erreur de validation",
          description: `La somme des pourcentages doit être de 100% (actuellement ${totalPourcentage}%)`,
          variant: "destructive"
        });
        return;
      }
      
      // Créer le projet
      const projetCree = await createProjet({
        titre: nouveauProjet.titre || "",
        description: nouveauProjet.description || "",
        poids: parseInt(nouveauPoids),
        date_debut: nouveauProjet.date_debut || new Date().toISOString().split('T')[0],
        actif: true
      });
      
      // Créer les participations
      for (const participation of nouvellesParticipations) {
        await createParticipationProjet({
          projet_id: projetCree.id,
          associe_id: participation.associe_id,
          pourcentage_contribution: participation.pourcentage_contribution
        });
      }
      
      // Rafraîchir les données
      const projetActifs = await getProjetsActifs();
      setProjetsActifs(projetActifs);
      
      // Mettre à jour les participations
      const participationsProjet = await getParticipationsByProjetId(projetCree.id);
      setParticipations(prev => ({
        ...prev,
        [projetCree.id]: participationsProjet
      }));
      
      // Réinitialiser le formulaire
      setShowCreateDialog(false);
      setNouveauProjet({
        titre: "",
        description: "",
        poids: 2,
        date_debut: new Date().toISOString().split('T')[0],
        actif: true
      });
      setNouvellesParticipations([]);
      setNouveauPoids("2");
      
      toast({
        title: "Succès",
        description: "Le projet a été créé avec succès",
      });
    } catch (err) {
      console.error("Erreur lors de la création du projet:", err);
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Gérer la modification d'un projet existant
  const handleEditProjet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProjet) return;
    
    try {
      // Mettre à jour le projet
      const projetMisAJour = await updateProjet(selectedProjet.id, {
        titre: (e.target as any).titre.value,
        description: (e.target as any).description.value,
        poids: parseInt(poidsModifie),
        date_debut: (e.target as any).date.value
      });
      
      // Rafraîchir les données
      if (projetMisAJour.actif) {
        const projetActifs = await getProjetsActifs();
        setProjetsActifs(projetActifs);
      } else {
        const projetTermines = await getProjetsTermines();
        setProjetsTermines(projetTermines);
      }
      
      // Fermer le dialogue
      setShowEditDialog(false);
      setSelectedProjet(null);
      
      toast({
        title: "Succès",
        description: "Le projet a été modifié avec succès",
      });
    } catch (err) {
      console.error("Erreur lors de la modification du projet:", err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le projet. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  // Archiver un projet (mettre fin)
  const handleArchiverProjet = async (projet: Projet) => {
    try {
      await terminerProjet(projet.id);
      
      // Rafraîchir les données
      const projetActifs = await getProjetsActifs();
      const projetTermines = await getProjetsTermines();
      
      setProjetsActifs(projetActifs);
      setProjetsTermines(projetTermines);
      
      toast({
        title: "Succès",
        description: "Le projet a été archivé avec succès",
      });
    } catch (err) {
      console.error("Erreur lors de l'archivage du projet:", err);
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le projet. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (projet: Projet) => {
    setSelectedProjet(projet);
    setPoidsModifie(projet.poids.toString());
    setShowEditDialog(true);
  };
  
  // Gérer l'ajout d'un participant à un nouveau projet
  const handleAjouterParticipant = (associeId: string, pourcentage: number) => {
    // Vérifier si l'associé est déjà dans la liste
    const index = nouvellesParticipations.findIndex(p => p.associe_id === associeId);
    
    if (index !== -1) {
      // Mettre à jour le pourcentage si l'associé existe déjà
      const newParticipations = [...nouvellesParticipations];
      newParticipations[index].pourcentage_contribution = pourcentage;
      setNouvellesParticipations(newParticipations);
    } else {
      // Ajouter un nouveau participant
      setNouvellesParticipations([
        ...nouvellesParticipations,
        { associe_id: associeId, pourcentage_contribution: pourcentage }
      ]);
    }
  };
  
  // Supprimer un participant d'un nouveau projet
  const handleSupprimerParticipant = (associeId: string) => {
    setNouvellesParticipations(
      nouvellesParticipations.filter(p => p.associe_id !== associeId)
    );
  };

  // Afficher un message d'erreur ou de chargement
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">{error}</h2>
        <Button 
          onClick={() => window.location.reload()}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projets et Missions</h1>
          <p className="mt-2">
            Gérez les projets et suivez la contribution des associés
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer un nouveau projet
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projets actifs</CardTitle>
          <CardDescription>
            Projets en cours de réalisation
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetsActifs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun projet actif
                  </TableCell>
                </TableRow>
              ) : projetsActifs.map((projet) => (
                <TableRow key={projet.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{projet.titre}</div>
                      <div className="text-xs text-muted-foreground">{projet.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(projet.date_debut)}</TableCell>
                  <TableCell>
                    {Array(projet.poids).fill(0).map((_, i) => (
                      <span key={i} className="text-primary">★</span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {participations[projet.id]?.map((participation) => (
                        <Avatar key={participation.id} className="border-2 border-background h-8 w-8" title={`${participation.associe?.prenom} ${participation.associe?.nom} (${participation.pourcentage_contribution}%)`}>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {participation.associe && getInitiales(participation.associe.nom, participation.associe.prenom)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(projet)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-amber-700 border-amber-200 hover:bg-amber-50"
                        onClick={() => handleArchiverProjet(projet)}
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archiver
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projets terminés</CardTitle>
          <CardDescription>
            Projets archivés et terminés
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Poids</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projetsTermines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun projet terminé
                  </TableCell>
                </TableRow>
              ) : projetsTermines.map((projet) => (
                <TableRow key={projet.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{projet.titre}</div>
                      <div className="text-xs text-muted-foreground">{projet.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(projet.date_debut)} -</div>
                      <div>{formatDate(projet.date_fin || "")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Array(projet.poids).fill(0).map((_, i) => (
                      <span key={i} className="text-muted-foreground">★</span>
                    ))}
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {participations[projet.id]?.map((participation) => (
                        <Avatar key={participation.id} className="border-2 border-background h-8 w-8" title={`${participation.associe?.prenom} ${participation.associe?.nom} (${participation.pourcentage_contribution}%)`}>
                          <AvatarFallback className="bg-muted text-muted-foreground">
                            {participation.associe && getInitiales(participation.associe.nom, participation.associe.prenom)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(projet)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogue de création de projet */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
            <DialogDescription>
              Complétez les informations pour créer un nouveau projet.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProjet}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre du projet*</Label>
                <Input 
                  id="titre" 
                  placeholder="Titre du projet" 
                  value={nouveauProjet.titre} 
                  onChange={(e) => handleChangeNouveauProjet('titre', e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Description du projet" 
                  value={nouveauProjet.description} 
                  onChange={(e) => handleChangeNouveauProjet('description', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date de début*</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={nouveauProjet.date_debut} 
                    onChange={(e) => handleChangeNouveauProjet('date_debut', e.target.value)}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="poids">Poids du projet*</Label>
                  <Select value={nouveauPoids} onValueChange={setNouveauPoids}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un poids" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Faible impact</SelectItem>
                      <SelectItem value="2">2 - Impact modéré</SelectItem>
                      <SelectItem value="3">3 - Impact majeur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Participants*</Label>
                <div className="border rounded-md p-4 space-y-4">
                  {nouvellesParticipations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-2">
                      Aucun participant sélectionné
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {nouvellesParticipations.map((participation) => {
                        const associe = associesActifs.find(a => a.id === participation.associe_id);
                        return (
                          <div key={participation.associe_id} className="flex items-center justify-between gap-2 p-2 bg-muted/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {associe && getInitiales(associe.nom, associe.prenom)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{associe?.prenom} {associe?.nom}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                className="w-20"
                                value={participation.pourcentage_contribution}
                                onChange={(e) => handleAjouterParticipant(
                                  participation.associe_id,
                                  parseInt(e.target.value) || 0
                                )}
                              />
                              <span>%</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSupprimerParticipant(participation.associe_id)}
                              >
                                ✕
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Total</span>
                        <span>
                          {nouvellesParticipations.reduce((sum, p) => sum + p.pourcentage_contribution, 0)}%
                          {nouvellesParticipations.reduce((sum, p) => sum + p.pourcentage_contribution, 0) !== 100 &&
                            <span className="text-destructive ml-2">(doit être 100%)</span>
                          }
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t">
                    <Select
                      onValueChange={(value) => handleAjouterParticipant(value, 0)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ajouter un participant" />
                      </SelectTrigger>
                      <SelectContent>
                        {associesActifs
                          .filter(a => !nouvellesParticipations.some(p => p.associe_id === a.id))
                          .map(associe => (
                            <SelectItem key={associe.id} value={associe.id}>
                              {associe.prenom} {associe.nom}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={
                !nouveauProjet.titre || 
                !nouveauProjet.date_debut || 
                nouvellesParticipations.length === 0 ||
                nouvellesParticipations.reduce((sum, p) => sum + p.pourcentage_contribution, 0) !== 100
              }>
                Créer le projet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification de projet */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le projet</DialogTitle>
            <DialogDescription>
              Modifiez les informations du projet sélectionné.
            </DialogDescription>
          </DialogHeader>
          {selectedProjet && (
            <form onSubmit={handleEditProjet}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titre-edit">Titre du projet</Label>
                  <Input id="titre-edit" name="titre" defaultValue={selectedProjet.titre} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description-edit">Description</Label>
                  <Textarea id="description-edit" name="description" defaultValue={selectedProjet.description || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date-edit">Date de début</Label>
                    <Input id="date-edit" name="date" type="date" defaultValue={selectedProjet.date_debut} required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="poids-edit">Poids du projet</Label>
                    <Select value={poidsModifie} onValueChange={setPoidsModifie}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un poids" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Faible impact</SelectItem>
                        <SelectItem value="2">2 - Impact modéré</SelectItem>
                        <SelectItem value="3">3 - Impact majeur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 