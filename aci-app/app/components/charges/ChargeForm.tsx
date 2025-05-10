'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createCharge, updateCharge } from '@/app/lib/supabase/db';
import { Charge } from '@/app/types';

// Liste des catégories de charges
const CATEGORIES = [
  "Loyer",
  "Équipement",
  "Salaires",
  "Services",
  "Fournitures",
  "Communications",
  "Assurances",
  "Impôts",
  "Formation",
  "Autre"
];

interface ChargeFormProps {
  charge?: Charge;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ChargeForm({ charge, onSuccess, onCancel }: ChargeFormProps) {
  const isEditMode = !!charge;
  
  const [formData, setFormData] = useState({
    montant: charge?.montant ? charge.montant.toString() : '',
    date: charge?.date ? charge.date.split('T')[0] : new Date().toISOString().split('T')[0],
    categorie: charge?.categorie || 'Autre',
    description: charge?.description || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const montantFloat = parseFloat(formData.montant);
      
      if (isNaN(montantFloat)) {
        throw new Error('Le montant doit être un nombre valide');
      }

      if (isEditMode && charge) {
        // Mode édition
        await updateCharge(charge.id, {
          montant: montantFloat,
          date: formData.date,
          categorie: formData.categorie,
          description: formData.description,
        });
      } else {
        // Mode création
        await createCharge({
          montant: montantFloat,
          date: formData.date,
          categorie: formData.categorie,
          description: formData.description,
        });
      }
      
      onSuccess();
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Modifier une charge' : 'Ajouter une charge'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="montant">Montant (€)</Label>
            <Input
              id="montant"
              name="montant"
              type="number"
              step="0.01"
              min="0"
              value={formData.montant}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categorie">Catégorie</Label>
            <select
              id="categorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description de la charge"
              required
            />
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