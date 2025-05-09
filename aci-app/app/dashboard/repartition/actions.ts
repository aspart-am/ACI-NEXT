'use server';

import { revalidatePath } from 'next/cache';
import { sauvegarderRepartition } from '@/app/lib/supabase/db';
import { ResultatRepartition } from '@/app/types';

export async function enregistrerRepartition(resultats: ResultatRepartition[]) {
  try {
    await sauvegarderRepartition(resultats);
    revalidatePath('/dashboard/repartition');
    return { success: true, message: 'La répartition a été sauvegardée avec succès.' };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la répartition:', error);
    return { 
      success: false, 
      message: 'Une erreur est survenue lors de la sauvegarde de la répartition.' 
    };
  }
} 