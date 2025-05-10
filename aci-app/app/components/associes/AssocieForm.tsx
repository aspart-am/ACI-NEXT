'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createAssociee, updateAssociee } from '@/app/lib/supabase/db';
import { Associe } from '@/app/types';

// Liste des descriptions métier possibles
const DESCRIPTIONS_METIER = [
  'medecin',
  'infirmiere',
  'podologue',
  'dentiste',
  'kinesitherapeute',
  'orthesiste',
  'pharmacien'
];

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

interface AssocieFormProps {
  associe?: Associe;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AssocieForm({ associe, onSuccess, onCancel }: AssocieFormProps) {
  const isEditMode = !!associe;
  
  const [formData, setFormData] = useState({
    nom: associe?.nom || '',
    prenom: associe?.prenom || '',
    est_co_gerant: associe?.est_co_gerant || false,
    date_entree: associe?.date_entree ? associe.date_entree.split('T')[0] : new Date().toISOString().split('T')[0],
    date_sortie: associe?.date_sortie ? associe.date_sortie.split('T')[0] : '',
    actif: associe?.actif !== undefined ? associe.actif : true,
    description_metier: associe?.description_metier || 'medecin',
    rpps: associe?.rpps || '',
    numero_ps: associe?.numero_ps || '',
    adresse: associe?.adresse || '',
    code_postal: associe?.code_postal || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && associe) {
        // Mode édition
        await updateAssociee(associe.id, {
          ...formData,
          date_sortie: formData.date_sortie || undefined,
        });
      } else {
        // Mode création
        await createAssociee({
          ...formData,
          date_sortie: formData.date_sortie || undefined,
          user_id: null, // À lier avec un utilisateur plus tard si nécessaire
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de la sauvegarde de l\'associé');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Modifier un associé' : 'Ajouter un associé'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_metier">Description métier</Label>
            <select
              id="description_metier"
              name="description_metier"
              value={formData.description_metier}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {DESCRIPTIONS_METIER.map(metier => (
                <option key={metier} value={metier}>{LIBELLES_METIER[metier]}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_entree">Date d'entrée</Label>
              <Input
                id="date_entree"
                name="date_entree"
                type="date"
                value={formData.date_entree}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date_sortie">Date de sortie (optionnel)</Label>
              <Input
                id="date_sortie"
                name="date_sortie"
                type="date"
                value={formData.date_sortie}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="est_co_gerant"
              checked={formData.est_co_gerant}
              onCheckedChange={(checked: boolean) => 
                handleCheckboxChange('est_co_gerant', checked)
              }
            />
            <Label htmlFor="est_co_gerant">Co-gérant</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked: boolean) => 
                handleCheckboxChange('actif', checked)
              }
            />
            <Label htmlFor="actif">Actif</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input
                id="adresse"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code_postal">Code postal</Label>
              <Input
                id="code_postal"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_ps">N° facturation PS</Label>
              <Input
                id="numero_ps"
                name="numero_ps"
                value={formData.numero_ps}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rpps">RPPS</Label>
              <Input
                id="rpps"
                name="rpps"
                value={formData.rpps}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-red-500">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Sauvegarde...' : isEditMode ? 'Modifier' : 'Ajouter'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 