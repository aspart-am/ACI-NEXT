'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PlusCircle, Edit, Check, X, Users, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllReunions, getParticipationsByReunionId, createReunion, updateReunion, createParticipationReunion, updateParticipationReunion, getAllAssocies } from "@/app/lib/supabase/db";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Participant {
  id: string;
  nom: string;
  prenom: string;
  present: boolean;
}

interface Reunion {
  id: string;
  titre: string;
  date: string;
  duree: number;
  description: string;
  participants: Participant[];
}

interface Associe {
  id: string;
  nom: string;
  prenom: string;
}

export default function ReunionsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPresenceDialog, setShowPresenceDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedReunion, setSelectedReunion] = useState<Reunion | null>(null);
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [loading, setLoading] = useState(true);
  const [associes, setAssocies] = useState<Associe[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReunions();
    loadAssocies();
  }, []);

  const loadReunions = async () => {
    try {
      setLoading(true);
      console.log('Chargement des réunions...');
      
      const reunionsData = await getAllReunions();
      console.log('Réunions chargées:', reunionsData);
      
      if (!reunionsData || reunionsData.length === 0) {
        console.log('Aucune réunion trouvée');
        setReunions([]);
        return;
      }

      const reunionsWithParticipants = await Promise.all(
        reunionsData.map(async (reunion) => {
          try {
            console.log('Chargement des participations pour la réunion:', reunion.id);
            const participations = await getParticipationsByReunionId(reunion.id);
            console.log('Participations chargées:', participations);
            
            return {
              ...reunion,
              participants: participations.map(p => ({
                id: p.associe_id,
                nom: p.associe?.nom || 'Inconnu',
                prenom: p.associe?.prenom || 'Inconnu',
                present: p.present
              }))
            };
          } catch (error) {
            console.error('Erreur lors du chargement des participations pour la réunion:', reunion.id, error);
            return {
              ...reunion,
              participants: []
            };
          }
        })
      );

      console.log('Réunions avec participants:', reunionsWithParticipants);
      setReunions(reunionsWithParticipants);
    } catch (error) {
      console.error('Erreur détaillée lors du chargement des réunions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réunions. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAssocies = async () => {
    try {
      const associesData = await getAllAssocies();
      setAssocies(associesData);
    } catch (error) {
      console.error('Erreur lors du chargement des associés:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des associés",
        variant: "destructive"
      });
    }
  };

  const handleCreateReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const titre = formData.get('titre') as string;
      const date = formData.get('date') as string;
      const duree = parseInt(formData.get('duree') as string);
      const description = formData.get('description') as string;

      console.log('Données du formulaire:', { titre, date, duree, description });

      if (!titre || !date || !duree) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const nouvelleReunion = await createReunion({
        titre,
        date,
        duree,
        description: description || ''
      });

      // Créer les participations pour chaque associé
      const associesIds = formData.getAll('participants') as string[];
      await Promise.all(
        associesIds.map(associeId =>
          createParticipationReunion({
            reunion_id: nouvelleReunion.id,
            associe_id: associeId,
            present: false
          })
        )
      );

      await loadReunions();
      setShowCreateDialog(false);
      toast({
        title: "Succès",
        description: "La réunion a été créée avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réunion",
        variant: "destructive"
      });
    }
  };

  const handleSavePresences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReunion) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      // Pour chaque associé, vérifier s'il a une participation
      await Promise.all(
        associes.map(async (associe) => {
          const isPresent = formData.get(`presence-${associe.id}`) === 'on';
          const existingParticipation = selectedReunion.participants.find(
            p => p.id === associe.id
          );

          if (existingParticipation) {
            // Mettre à jour la participation existante
            await updateParticipationReunion(
              selectedReunion.id,
              associe.id,
              isPresent
            );
          } else {
            // Créer une nouvelle participation
            await createParticipationReunion({
              reunion_id: selectedReunion.id,
              associe_id: associe.id,
              present: isPresent
            });
          }
        })
      );

      // Recharger les réunions pour mettre à jour l'affichage
      await loadReunions();
      
      // Mettre à jour la réunion sélectionnée avec les nouvelles participations
      const updatedReunion = reunions.find(r => r.id === selectedReunion.id);
      if (updatedReunion) {
        setSelectedReunion(updatedReunion);
      }

      setShowPresenceDialog(false);
      toast({
        title: "Succès",
        description: "Les présences ont été mises à jour"
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des présences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les présences",
        variant: "destructive"
      });
    }
  };

  const handleEditReunion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReunion) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const titre = formData.get('titre') as string;
      const date = formData.get('date') as string;
      const duree = parseInt(formData.get('duree') as string);
      const description = formData.get('description') as string;

      if (!titre || !date || !duree) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      await updateReunion(selectedReunion.id, {
        titre,
        date,
        duree,
        description: description || ''
      });

      await loadReunions();
      setShowEditDialog(false);
      setSelectedReunion(null);
      toast({
        title: "Succès",
        description: "La réunion a été modifiée avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la modification de la réunion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la réunion",
        variant: "destructive"
      });
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Fonction pour obtenir les initiales
  const getInitiales = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`;
  };

  const openPresenceDialog = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setShowPresenceDialog(true);
  };

  const openEditDialog = (reunion: Reunion) => {
    setSelectedReunion(reunion);
    setShowEditDialog(true);
  };

  const prochainesReunions = reunions.filter(r => new Date(r.date) > new Date()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const reunionsPassees = reunions.filter(r => new Date(r.date) <= new Date()).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Réunions</h1>
          <p className="mt-2">
            Planifiez et gérez les réunions de coordination et RCP
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Créer une nouvelle réunion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prochaines réunions</CardTitle>
          <CardDescription>
            Liste des réunions à venir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {prochainesReunions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prochainesReunions.map((reunion) => (
                  <TableRow key={reunion.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{reunion.titre}</div>
                        <div className="text-xs text-muted-foreground">{reunion.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reunion.date)}</TableCell>
                    <TableCell>{reunion.duree} min</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {reunion.participants.map((participant) => (
                          <Avatar key={participant.id} className="border-2 border-background h-8 w-8">
                            <AvatarFallback className={participant.present ? "bg-primary" : "bg-muted"}>
                              {getInitiales(participant.nom, participant.prenom)}
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
                          onClick={() => openEditDialog(reunion)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openPresenceDialog(reunion)}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Présences
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Calendar className="h-10 w-10 mr-4 opacity-50" />
              <div>
                <h3 className="text-lg font-semibold">Aucune réunion à venir</h3>
                <p className="text-sm">Planifiez une nouvelle réunion en cliquant sur le bouton "Créer une nouvelle réunion"</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réunions passées</CardTitle>
          <CardDescription>
            Historique des réunions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {reunionsPassees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reunionsPassees.map((reunion) => (
                  <TableRow key={reunion.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{reunion.titre}</div>
                        <div className="text-xs text-muted-foreground">{reunion.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(reunion.date)}</TableCell>
                    <TableCell>{reunion.duree} min</TableCell>
                    <TableCell>
                      <div className="flex -space-x-2">
                        {reunion.participants.map((participant) => (
                          <Avatar key={participant.id} className="border-2 border-background h-8 w-8">
                            <AvatarFallback className={participant.present ? "bg-primary" : "bg-muted"}>
                              {getInitiales(participant.nom, participant.prenom)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openPresenceDialog(reunion)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Présences
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Calendar className="h-10 w-10 mr-4 opacity-50" />
              <div>
                <h3 className="text-lg font-semibold">Aucune réunion passée</h3>
                <p className="text-sm">Les réunions passées apparaîtront ici</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de création de réunion */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une nouvelle réunion</DialogTitle>
            <DialogDescription>
              Complétez les informations pour planifier une nouvelle réunion.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReunion}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titre">Titre de la réunion</Label>
                <Input id="titre" name="titre" placeholder="Titre de la réunion" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Description et objectifs de la réunion" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date et heure</Label>
                  <Input id="date" name="date" type="datetime-local" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duree">Durée (minutes)</Label>
                  <Input id="duree" name="duree" type="number" min="15" step="15" defaultValue="60" required />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer la réunion</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de modification de réunion */}
      {selectedReunion && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la réunion</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la réunion.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditReunion}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="titre">Titre de la réunion</Label>
                  <Input 
                    id="titre" 
                    name="titre" 
                    defaultValue={selectedReunion.titre}
                    placeholder="Titre de la réunion" 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    defaultValue={selectedReunion.description}
                    placeholder="Description et objectifs de la réunion" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date et heure</Label>
                    <Input 
                      id="date" 
                      name="date" 
                      type="datetime-local" 
                      defaultValue={selectedReunion.date.slice(0, 16)}
                      required 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duree">Durée (minutes)</Label>
                    <Input 
                      id="duree" 
                      name="duree" 
                      type="number" 
                      min="15" 
                      step="15" 
                      defaultValue={selectedReunion.duree}
                      required 
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer les modifications</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialogue de gestion des présences */}
      {selectedReunion && (
        <Dialog open={showPresenceDialog} onOpenChange={setShowPresenceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gestion des présences</DialogTitle>
              <DialogDescription>
                {selectedReunion.titre} - {formatDate(selectedReunion.date)}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSavePresences}>
              <div className="py-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Participant</TableHead>
                        <TableHead className="w-16 text-center">Présent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {associes.map((associe) => {
                        const participation = selectedReunion.participants.find(
                          p => p.id === associe.id
                        );
                        return (
                          <TableRow key={associe.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {getInitiales(associe.nom, associe.prenom)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>{associe.prenom} {associe.nom}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox 
                                id={`presence-${associe.id}`}
                                name={`presence-${associe.id}`}
                                defaultChecked={participation?.present || false}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowPresenceDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 