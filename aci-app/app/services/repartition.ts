import { 
  Associe, 
  ParametresRepartition, 
  ParticipationProjet, 
  ParticipationReunion,
  Projet,
  Reunion,
  ResultatRepartition
} from '../types';

import {
  getAssociesActifs,
  getParametresRepartitionActifs,
  getAllReunions,
  getParticipationsByReunionId,
  getProjetsActifs,
  getParticipationsByProjetId,
  getRevenuNet
} from '../lib/supabase/db';

// Fonction pour calculer la répartition basée sur les données Supabase
export async function calculerRepartitionSupabase(): Promise<ResultatRepartition[]> {
  try {
    console.log('===== Début du calcul de répartition =====');
    
    // Récupération de toutes les données nécessaires
    console.log('1. Récupération des associés actifs...');
    let associes = [];
    try {
      associes = await getAssociesActifs();
      console.log('Associés récupérés:', associes?.length || 0);
    } catch (err) {
      console.error('Erreur lors de la récupération des associés:', err);
      associes = [];
    }
    
    if (associes.length === 0) {
      console.log('Aucun associé actif trouvé, impossible de calculer la répartition');
      return [];
    }
    
    console.log('2. Récupération des paramètres...');
    let parametres = null;
    try {
      parametres = await getParametresRepartitionActifs();
      console.log('Paramètres récupérés:', parametres ? 'OK' : 'NON - Utilisation des valeurs par défaut');
    } catch (err) {
      console.error('Erreur lors de la récupération des paramètres:', err);
    }
    
    // Si pas de paramètres, utiliser des valeurs par défaut
    const parametresEffectifs = parametres || {
      id: 'default',
      coefficient_co_gerant: 1.0,
      pourcentage_fixe: 50,
      pourcentage_reunions: 25,
      pourcentage_projets: 25,
      date_modification: new Date().toISOString(),
      actif: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('3. Récupération des réunions...');
    let reunions = [];
    try {
      reunions = await getAllReunions();
      console.log('Réunions récupérées:', reunions?.length || 0);
    } catch (err) {
      console.error('Erreur lors de la récupération des réunions:', err);
      reunions = [];
    }
    
    console.log('4. Récupération des projets actifs...');
    let projets = [];
    try {
      projets = await getProjetsActifs();
      console.log('Projets récupérés:', projets?.length || 0);
    } catch (err) {
      console.error('Erreur lors de la récupération des projets:', err);
      projets = [];
    }
    
    console.log('5. Récupération du revenu net...');
    let revenuNet = 0;
    try {
      revenuNet = await getRevenuNet();
      console.log('Revenu net récupéré:', revenuNet);
    } catch (err) {
      console.error('Erreur lors de la récupération du revenu net:', err);
    }
    
    console.log('6. Récupération des participations aux réunions...');
    const participationsReunions: ParticipationReunion[] = [];
    for (const reunion of reunions) {
      try {
        console.log(`Récupération des participations pour la réunion ${reunion.id}...`);
        const participations = await getParticipationsByReunionId(reunion.id);
        console.log(`Participations récupérées pour la réunion ${reunion.id}:`, participations?.length || 0);
        participationsReunions.push(...participations);
      } catch (err) {
        console.error(`Erreur lors de la récupération des participations pour la réunion ${reunion.id}:`, err);
      }
    }
    console.log('Total participations réunions récupérées:', participationsReunions.length);
    
    console.log('7. Récupération des participations aux projets...');
    const participationsProjets: ParticipationProjet[] = [];
    for (const projet of projets) {
      try {
        console.log(`Récupération des participations pour le projet ${projet.id}...`);
        const participations = await getParticipationsByProjetId(projet.id);
        console.log(`Participations récupérées pour le projet ${projet.id}:`, participations?.length || 0);
        participationsProjets.push(...participations);
      } catch (err) {
        console.error(`Erreur lors de la récupération des participations pour le projet ${projet.id}:`, err);
      }
    }
    console.log('Total participations projets récupérées:', participationsProjets.length);
    
    console.log('8. Calcul final de la répartition...');
    const resultats = calculerRepartition(
      associes, 
      participationsReunions, 
      reunions, 
      participationsProjets, 
      projets, 
      parametresEffectifs, 
      revenuNet
    );
    
    console.log('===== Calcul de répartition terminé =====');
    console.log('Nombre de résultats:', resultats.length);
    
    return resultats;
  } catch (error) {
    console.error('ERREUR DÉTAILLÉE lors du calcul de la répartition:', error);
    return []; // Retourner un tableau vide en cas d'erreur
  }
}

export function calculerRepartition(
  associes: Associe[],
  participationsReunions: ParticipationReunion[],
  reunions: Reunion[],
  participationsProjets: ParticipationProjet[],
  projets: Projet[],
  parametres: ParametresRepartition,
  revenuNet: number
): ResultatRepartition[] {
  const associesActifs = associes.filter(a => a.actif);
  
  // Part fixe
  const totalCoefficients = associesActifs.reduce((total, associe) => {
    return total + (associe.est_co_gerant ? parametres.coefficient_co_gerant : 1);
  }, 0);
  
  const montantFixe = revenuNet * (parametres.pourcentage_fixe / 100);
  
  // Part réunions
  const montantReunions = revenuNet * (parametres.pourcentage_reunions / 100);
  
  // Calcul du temps de présence total aux réunions
  const presencesTotales = calculerPresenceTotale(
    associesActifs, 
    participationsReunions, 
    reunions
  );
  
  // Part projets
  const montantProjets = revenuNet * (parametres.pourcentage_projets / 100);
  
  // Calcul des contributions totales aux projets
  const contributionsTotales = calculerContributionTotale(
    associesActifs, 
    participationsProjets, 
    projets
  );
  
  // Calcul des parts individuelles
  const resultats = associesActifs.map(associe => {
    // Calcul part fixe individuelle
    const coefficientAssocie = associe.est_co_gerant ? parametres.coefficient_co_gerant : 1;
    const partFixe = (montantFixe * coefficientAssocie) / totalCoefficients;
    
    // Calcul part réunions individuelle
    const presenceAssocie = presencesTotales.find(p => p.associeId === associe.id)?.temps || 0;
    const totalTempsPresence = presencesTotales.reduce((total, presence) => total + presence.temps, 0);
    const partReunions = totalTempsPresence > 0 
      ? (montantReunions * presenceAssocie) / totalTempsPresence 
      : 0;
    
    // Calcul part projets individuelle
    const contributionAssocie = contributionsTotales.find(c => c.associeId === associe.id)?.contribution || 0;
    const totalContributions = contributionsTotales.reduce((total, contribution) => 
      total + contribution.contribution, 0);
    const partProjets = totalContributions > 0 
      ? (montantProjets * contributionAssocie) / totalContributions 
      : 0;
    
    const total = partFixe + partReunions + partProjets;
    
    return {
      associeId: associe.id,
      nom: associe.nom,
      prenom: associe.prenom,
      partFixe,
      partReunions,
      partProjets,
      total,
      pourcentageTotal: 0 // sera calculé plus tard
    };
  });
  
  // Calcul des pourcentages
  const montantTotal = resultats.reduce((total, resultat) => total + resultat.total, 0);
  
  return resultats.map(resultat => ({
    ...resultat,
    pourcentageTotal: montantTotal > 0 ? (resultat.total / montantTotal) * 100 : 0
  }));
}

// Calcul du temps de présence aux réunions par associé
function calculerPresenceTotale(
  associes: Associe[], 
  participations: ParticipationReunion[], 
  reunions: Reunion[]
) {
  return associes.map(associe => {
    const participationsAssocie = participations.filter(
      p => p.associe_id === associe.id && p.present
    );
    
    const temps = participationsAssocie.reduce((total, participation) => {
      const reunion = reunions.find(r => r.id === participation.reunion_id);
      return reunion ? total + reunion.duree : total;
    }, 0);
    
    return {
      associeId: associe.id,
      temps
    };
  });
}

// Calcul de la contribution aux projets par associé
function calculerContributionTotale(
  associes: Associe[], 
  participations: ParticipationProjet[], 
  projets: Projet[]
) {
  return associes.map(associe => {
    const participationsAssocie = participations.filter(
      p => p.associe_id === associe.id
    );
    
    const contribution = participationsAssocie.reduce((total, participation) => {
      const projet = projets.find(p => p.id === participation.projet_id);
      if (!projet || !projet.actif) return total;
      
      // La contribution est calculée en multipliant le pourcentage de contribution
      // par le poids du projet
      return total + (participation.pourcentage_contribution * projet.poids);
    }, 0);
    
    return {
      associeId: associe.id,
      contribution
    };
  });
} 