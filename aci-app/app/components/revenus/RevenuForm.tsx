'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { createRevenu, updateRevenu } from '@/app/lib/supabase/db';
import { RevenuBrut } from '@/app/types';

interface RevenuFormProps {
  revenu?: RevenuBrut;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RevenuForm({ revenu, onSuccess, onCancel }: RevenuFormProps) {
  const isEditMode = !!revenu;
  
  const [formData, setFormData] = useState({
    montant: revenu?.montant ? revenu.montant.toString() : '',
    date: revenu?.date ? revenu.date.split('T')[0] : new Date().toISOString().split('T')[0],
    description: revenu?.description || '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

      if (isEditMode && revenu) {
        // Mode édition
        await updateRevenu(revenu.id, {
          montant: montantFloat,
          date: formData.date,
          description: formData.description,
        });
      } else {
        // Mode création
        await createRevenu({
          montant: montantFloat,
          date: formData.date,
          description: formData.description,
        });
      }
      
      onSuccess();
    } catch (err: unknown) {
      console.error('Erreur lors de la sauvegarde:', err);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? 'Modifier un revenu' : 'Ajouter un revenu'}</CardTitle>
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
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description du revenu"
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