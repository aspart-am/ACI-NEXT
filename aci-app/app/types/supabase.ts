export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      associes: {
        Row: {
          id: string
          nom: string
          prenom: string
          est_co_gerant: boolean
          actif: boolean
          date_entree: string
          date_sortie: string | null
          created_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          nom: string
          prenom: string
          est_co_gerant: boolean
          actif: boolean
          date_entree: string
          date_sortie?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          est_co_gerant?: boolean
          actif?: boolean
          date_entree?: string
          date_sortie?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string | null
        }
      }
      charges: {
        Row: {
          id: string
          montant: number
          date: string
          categorie: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          montant: number
          date: string
          categorie: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          montant?: number
          date?: string
          categorie?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      historique_repartitions: {
        Row: {
          id: string
          date_calcul: string
          revenu_net_total: number
          parametres_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date_calcul: string
          revenu_net_total: number
          parametres_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date_calcul?: string
          revenu_net_total?: number
          parametres_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      parametres_repartition: {
        Row: {
          id: string
          coefficient_co_gerant: number
          pourcentage_fixe: number
          pourcentage_reunions: number
          pourcentage_projets: number
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          coefficient_co_gerant: number
          pourcentage_fixe: number
          pourcentage_reunions: number
          pourcentage_projets: number
          actif: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          coefficient_co_gerant?: number
          pourcentage_fixe?: number
          pourcentage_reunions?: number
          pourcentage_projets?: number
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      participations_projets: {
        Row: {
          id: string
          projet_id: string
          associe_id: string
          pourcentage_contribution: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          projet_id: string
          associe_id: string
          pourcentage_contribution: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          projet_id?: string
          associe_id?: string
          pourcentage_contribution?: number
          created_at?: string
          updated_at?: string
        }
      }
      participations_reunions: {
        Row: {
          id: string
          reunion_id: string
          associe_id: string
          present: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reunion_id: string
          associe_id: string
          present: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reunion_id?: string
          associe_id?: string
          present?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projets: {
        Row: {
          id: string
          nom: string
          description: string
          date_debut: string
          date_fin: string | null
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description: string
          date_debut: string
          date_fin?: string | null
          actif: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string
          date_debut?: string
          date_fin?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reunions: {
        Row: {
          id: string
          date: string
          type: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          type: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          type?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      revenus_bruts: {
        Row: {
          id: string
          montant: number
          date: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          montant: number
          date: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          montant?: number
          date?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 