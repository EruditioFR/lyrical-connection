export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      artist_airs: {
        Row: {
          artist_profile_id: string
          created_at: string
          description: string | null
          display_order: number | null
          duration: number | null
          external_url: string | null
          file_path: string | null
          id: string
          is_active: boolean | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_airs_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_photos: {
        Row: {
          artist_profile_id: string
          created_at: string
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_profile_photo: boolean | null
          mime_type: string | null
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_profile_photo?: boolean | null
          mime_type?: string | null
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_profile_photo?: boolean | null
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_photos_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profiles: {
        Row: {
          bio: string | null
          contact_email: string | null
          cover_image_url: string | null
          created_at: string
          experience_years: number | null
          id: string
          is_active: boolean | null
          location: string | null
          phone: string | null
          profile_image_url: string | null
          repertoire: string[] | null
          social_links: Json | null
          stage_name: string
          updated_at: string
          user_id: string
          voice_type: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          repertoire?: string[] | null
          social_links?: Json | null
          stage_name: string
          updated_at?: string
          user_id: string
          voice_type?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          phone?: string | null
          profile_image_url?: string | null
          repertoire?: string[] | null
          social_links?: Json | null
          stage_name?: string
          updated_at?: string
          user_id?: string
          voice_type?: string | null
          website?: string | null
        }
        Relationships: []
      }
      artist_repertoire: {
        Row: {
          artist_profile_id: string
          created_at: string
          id: string
          mastery_level: string | null
          notes: string | null
          role_id: string | null
          updated_at: string
          work_id: string
          years_experience: number | null
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          id?: string
          mastery_level?: string | null
          notes?: string | null
          role_id?: string | null
          updated_at?: string
          work_id: string
          years_experience?: number | null
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          id?: string
          mastery_level?: string | null
          notes?: string | null
          role_id?: string | null
          updated_at?: string
          work_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_repertoire_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_repertoire_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "work_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_repertoire_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "lyrical_works"
            referencedColumns: ["id"]
          },
        ]
      }
      lyrical_works: {
        Row: {
          category: string
          composer: string
          created_at: string
          description: string | null
          difficulty_level: number | null
          id: string
          language: string | null
          period: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          composer: string
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          language?: string | null
          period?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          composer?: string
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          language?: string | null
          period?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      work_roles: {
        Row: {
          aria_title: string | null
          created_at: string
          description: string | null
          id: string
          role_name: string
          voice_type: string | null
          work_id: string
        }
        Insert: {
          aria_title?: string | null
          created_at?: string
          description?: string | null
          id?: string
          role_name: string
          voice_type?: string | null
          work_id: string
        }
        Update: {
          aria_title?: string | null
          created_at?: string
          description?: string | null
          id?: string
          role_name?: string
          voice_type?: string | null
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_roles_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "lyrical_works"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
