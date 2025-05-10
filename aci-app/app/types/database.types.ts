export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      associes: {
        Row: {
          actif: boolean | null
          created_at: string | null
          date_entree: string
          date_sortie: string | null
          est_co_gerant: boolean | null
          id: string
          nom: string
          prenom: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          date_entree: string
          date_sortie?: string | null
          est_co_gerant?: boolean | null
          id?: string
          nom: string
          prenom: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          date_entree?: string
          date_sortie?: string | null
          est_co_gerant?: boolean | null
          id?: string
          nom?: string
          prenom?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      charges: {
        Row: {
          categorie: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          montant: number
          updated_at: string | null
        }
        Insert: {
          categorie: string
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          montant: number
          updated_at?: string | null
        }
        Update: {
          categorie?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          montant?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      details_repartition: {
        Row: {
          associe_id: string
          created_at: string
          historique_id: string
          id: string
          part_fixe: number
          part_projets: number
          part_reunions: number
          pourcentage_total: number
          total: number
          updated_at: string
        }
        Insert: {
          associe_id: string
          created_at?: string
          historique_id: string
          id?: string
          part_fixe: number
          part_projets: number
          part_reunions: number
          pourcentage_total: number
          total: number
          updated_at?: string
        }
        Update: {
          associe_id?: string
          created_at?: string
          historique_id?: string
          id?: string
          part_fixe?: number
          part_projets?: number
          part_reunions?: number
          pourcentage_total?: number
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "details_repartition_associe_id_fkey"
            columns: ["associe_id"]
            isOneToOne: false
            referencedRelation: "associes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "details_repartition_historique_id_fkey"
            columns: ["historique_id"]
            isOneToOne: false
            referencedRelation: "historique_repartitions"
            referencedColumns: ["id"]
          },
        ]
      }
      historique_repartitions: {
        Row: {
          created_at: string
          date_calcul: string
          id: string
          parametres_id: string
          revenu_net_total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_calcul?: string
          id?: string
          parametres_id: string
          revenu_net_total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_calcul?: string
          id?: string
          parametres_id?: string
          revenu_net_total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historique_repartitions_parametres_id_fkey"
            columns: ["parametres_id"]
            isOneToOne: false
            referencedRelation: "parametres_repartition"
            referencedColumns: ["id"]
          },
        ]
      }
      parametres_repartition: {
        Row: {
          actif: boolean | null
          coefficient_co_gerant: number
          created_at: string | null
          date_debut: string
          id: string
          pourcentage_fixe: number
          pourcentage_projets: number
          pourcentage_reunions: number
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          coefficient_co_gerant?: number
          created_at?: string | null
          date_debut?: string
          id?: string
          pourcentage_fixe?: number
          pourcentage_projets?: number
          pourcentage_reunions?: number
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          coefficient_co_gerant?: number
          created_at?: string | null
          date_debut?: string
          id?: string
          pourcentage_fixe?: number
          pourcentage_projets?: number
          pourcentage_reunions?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      participations_projets: {
        Row: {
          associe_id: string
          created_at: string | null
          id: string
          pourcentage_contribution: number
          projet_id: string
          updated_at: string | null
        }
        Insert: {
          associe_id: string
          created_at?: string | null
          id?: string
          pourcentage_contribution: number
          projet_id: string
          updated_at?: string | null
        }
        Update: {
          associe_id?: string
          created_at?: string | null
          id?: string
          pourcentage_contribution?: number
          projet_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participations_projets_associe_id_fkey"
            columns: ["associe_id"]
            isOneToOne: false
            referencedRelation: "associes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participations_projets_projet_id_fkey"
            columns: ["projet_id"]
            isOneToOne: false
            referencedRelation: "projets"
            referencedColumns: ["id"]
          },
        ]
      }
      participations_reunions: {
        Row: {
          associe_id: string
          created_at: string | null
          id: string
          present: boolean | null
          reunion_id: string
          updated_at: string | null
        }
        Insert: {
          associe_id: string
          created_at?: string | null
          id?: string
          present?: boolean | null
          reunion_id: string
          updated_at?: string | null
        }
        Update: {
          associe_id?: string
          created_at?: string | null
          id?: string
          present?: boolean | null
          reunion_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_associe"
            columns: ["associe_id"]
            isOneToOne: false
            referencedRelation: "associes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reunion"
            columns: ["reunion_id"]
            isOneToOne: false
            referencedRelation: "reunions"
            referencedColumns: ["id"]
          },
        ]
      }
      projets: {
        Row: {
          actif: boolean | null
          created_at: string | null
          date_debut: string
          date_fin: string | null
          description: string | null
          id: string
          poids: number
          titre: string
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          created_at?: string | null
          date_debut: string
          date_fin?: string | null
          description?: string | null
          id?: string
          poids?: number
          titre: string
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          created_at?: string | null
          date_debut?: string
          date_fin?: string | null
          description?: string | null
          id?: string
          poids?: number
          titre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      reunions: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          duree: number
          id: string
          titre: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          duree: number
          id?: string
          titre: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          duree?: number
          id?: string
          titre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenus_bruts: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          montant: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          montant: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          montant?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculer_repartition: {
        Args: { annee: number; mois: number }
        Returns: Json
      }
      exec_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      get_dashboard_data: {
        Args: Record<PropertyKey, never> | { annee_param?: number }
        Returns: Json
      }
      get_financial_summary: {
        Args: { start_date: string; end_date: string }
        Returns: Json
      }
      get_projet_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_reunion_stats: {
        Args: { start_date: string; end_date: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
