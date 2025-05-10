// Types pour les utilisateurs et associés
export type Role = 'admin' | 'reader';

export interface Utilisateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: Role;
}

export interface Associe {
  id: string;
  user_id: string | null;
  nom: string;
  prenom: string;
  est_co_gerant: boolean;
  date_entree: string;
  date_sortie?: string;
  actif: boolean;
  description_metier: 'medecin' | 'infirmiere' | 'podologue' | 'dentiste' | 'kinesitherapeute' | 'orthesiste';
  created_at: string;
  updated_at: string;
}

// Types pour les revenus et charges
export interface RevenuBrut {
  id: string;
  montant: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Charge {
  id: string;
  montant: number;
  date: string;
  categorie: string;
  description: string;
  created_at: string;
  updated_at: string;
}

// Types pour les réunions
export interface Reunion {
  id: string;
  titre: string;
  date: string;
  duree: number; // en minutes
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ParticipationReunion {
  id: string;
  reunion_id: string;
  associe_id: string;
  present: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  associe?: Associe;
  reunion?: Reunion;
}

// Types pour les projets et missions
export interface Projet {
  id: string;
  titre: string;
  description: string;
  poids: number; // facteur d'importance du projet
  date_debut: string;
  date_fin?: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParticipationProjet {
  id: string;
  projet_id: string;
  associe_id: string;
  pourcentage_contribution: number; // pourcentage de contribution au projet
  created_at: string;
  updated_at: string;
  // Relations
  associe?: Associe;
  projet?: Projet;
}

// Types pour les paramètres de répartition
export interface ParametresRepartition {
  id: string;
  coefficient_co_gerant: number; // ex: 1.2 pour une majoration de 20%
  pourcentage_fixe: number; // ex: 50 pour 50%
  pourcentage_reunions: number; // ex: 25 pour 25%
  pourcentage_projets: number; // ex: 25 pour 25%
  date_modification: string;
  actif: boolean;
}

// Type pour le résultat de la répartition
export interface ResultatRepartition {
  associeId: string;
  nom: string;
  prenom: string;
  partFixe: number;
  partReunions: number;
  partProjets: number;
  total: number;
  pourcentageTotal: number;
}

// Types pour l'historique des répartitions
export interface HistoriqueRepartition {
  id: string;
  date_calcul: string;
  revenu_net_total: number;
  parametres_id: string;
  created_at: string;
  updated_at: string;
  // Relations
  parametres?: ParametresRepartition;
  details?: DetailRepartition[];
}

export interface DetailRepartition {
  id: string;
  historique_id: string;
  associe_id: string;
  part_fixe: number;
  part_reunions: number;
  part_projets: number;
  total: number;
  pourcentage_total: number;
  created_at: string;
  updated_at: string;
  // Relations
  associe?: Associe;
} 