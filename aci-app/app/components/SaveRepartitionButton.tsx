'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { enregistrerRepartition } from '@/app/dashboard/repartition/actions';
import { ResultatRepartition } from '@/app/types';
import { useToast } from '@/components/ui/use-toast';

interface SaveRepartitionButtonProps {
  resultats: ResultatRepartition[];
}

export function SaveRepartitionButton({ resultats }: SaveRepartitionButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (resultats.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Aucune donnée de répartition à sauvegarder',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await enregistrerRepartition(resultats);
      
      if (result.success) {
        toast({
          title: 'Succès',
          description: result.message,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSave} 
      disabled={loading || resultats.length === 0}
      size="sm"
    >
      {loading ? 'Sauvegarde en cours...' : 'Sauvegarder cette répartition'}
    </Button>
  );
} 