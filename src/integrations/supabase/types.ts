export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      account_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          is_used: boolean
          profile_id: string
          profile_type: string
          real_email: string
          updated_at: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          invitation_token: string
          is_used?: boolean
          profile_id: string
          profile_type: string
          real_email: string
          updated_at?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          is_used?: boolean
          profile_id?: string
          profile_type?: string
          real_email?: string
          updated_at?: string
          used_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          metadata: Json | null
          name: string
          permissions: Json | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          metadata?: Json | null
          name: string
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          metadata?: Json | null
          name?: string
          permissions?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          id: string
          max_requests: number | null
          requests_count: number | null
          window_size_seconds: number | null
          window_start: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          max_requests?: number | null
          requests_count?: number | null
          window_size_seconds?: number | null
          window_start?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          max_requests?: number | null
          requests_count?: number | null
          window_size_seconds?: number | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          additional_documents: string[] | null
          artist_profile_id: string
          audition_notes: string | null
          audition_scheduled_at: string | null
          availability_notes: string | null
          casting_id: string
          cover_letter: string | null
          created_at: string
          id: string
          motivation: string | null
          professional_notes: string | null
          status: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          additional_documents?: string[] | null
          artist_profile_id: string
          audition_notes?: string | null
          audition_scheduled_at?: string | null
          availability_notes?: string | null
          casting_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          motivation?: string | null
          professional_notes?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          additional_documents?: string[] | null
          artist_profile_id?: string
          audition_notes?: string | null
          audition_scheduled_at?: string | null
          availability_notes?: string | null
          casting_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          motivation?: string | null
          professional_notes?: string | null
          status?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      aria_texts: {
        Row: {
          aria_id: string
          created_at: string | null
          full_text: string
          id: string
          language: string
          phonetic_transcription: string | null
          translation: string | null
          verse_structure: Json | null
        }
        Insert: {
          aria_id: string
          created_at?: string | null
          full_text: string
          id?: string
          language: string
          phonetic_transcription?: string | null
          translation?: string | null
          verse_structure?: Json | null
        }
        Update: {
          aria_id?: string
          created_at?: string | null
          full_text?: string
          id?: string
          language?: string
          phonetic_transcription?: string | null
          translation?: string | null
          verse_structure?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "aria_texts_aria_id_fkey"
            columns: ["aria_id"]
            isOneToOne: false
            referencedRelation: "arias"
            referencedColumns: ["id"]
          },
        ]
      }
      arias: {
        Row: {
          act_number: number | null
          aria_type: string | null
          created_at: string | null
          difficulty_level: number | null
          dramatic_context: string | null
          duration_minutes: number | null
          first_line: string | null
          id: string
          key_signature: string | null
          role_id: string | null
          scene_number: number | null
          style_period: string | null
          tempo_marking: string | null
          tessitura_max: string | null
          tessitura_min: string | null
          title: string
          updated_at: string | null
          vocal_technique_notes: string | null
          work_id: string
        }
        Insert: {
          act_number?: number | null
          aria_type?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          dramatic_context?: string | null
          duration_minutes?: number | null
          first_line?: string | null
          id?: string
          key_signature?: string | null
          role_id?: string | null
          scene_number?: number | null
          style_period?: string | null
          tempo_marking?: string | null
          tessitura_max?: string | null
          tessitura_min?: string | null
          title: string
          updated_at?: string | null
          vocal_technique_notes?: string | null
          work_id: string
        }
        Update: {
          act_number?: number | null
          aria_type?: string | null
          created_at?: string | null
          difficulty_level?: number | null
          dramatic_context?: string | null
          duration_minutes?: number | null
          first_line?: string | null
          id?: string
          key_signature?: string | null
          role_id?: string | null
          scene_number?: number | null
          style_period?: string | null
          tempo_marking?: string | null
          tessitura_max?: string | null
          tessitura_min?: string | null
          title?: string
          updated_at?: string | null
          vocal_technique_notes?: string | null
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "arias_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "work_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arias_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "lyrical_works"
            referencedColumns: ["id"]
          },
        ]
      }
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
          birth_date: string | null
          contact_email: string | null
          cover_image_url: string | null
          created_at: string
          created_by_admin: string | null
          experience_years: number | null
          gender: string | null
          id: string
          is_active: boolean | null
          is_free_account: boolean | null
          location: string | null
          nationality: string | null
          phone: string | null
          premium_subscription_end: string | null
          profile_image_url: string | null
          project_description: string | null
          public_visibility_premium: boolean | null
          repertoire: string[] | null
          social_links: Json | null
          spoken_languages: string[] | null
          stage_name: string
          tenant_id: string | null
          updated_at: string
          user_id: string
          voice_type: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          birth_date?: string | null
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_free_account?: boolean | null
          location?: string | null
          nationality?: string | null
          phone?: string | null
          premium_subscription_end?: string | null
          profile_image_url?: string | null
          project_description?: string | null
          public_visibility_premium?: boolean | null
          repertoire?: string[] | null
          social_links?: Json | null
          spoken_languages?: string[] | null
          stage_name: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
          voice_type?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          birth_date?: string | null
          contact_email?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by_admin?: string | null
          experience_years?: number | null
          gender?: string | null
          id?: string
          is_active?: boolean | null
          is_free_account?: boolean | null
          location?: string | null
          nationality?: string | null
          phone?: string | null
          premium_subscription_end?: string | null
          profile_image_url?: string | null
          project_description?: string | null
          public_visibility_premium?: boolean | null
          repertoire?: string[] | null
          social_links?: Json | null
          spoken_languages?: string[] | null
          stage_name?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
          voice_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_repertoire: {
        Row: {
          artist_profile_id: string
          created_at: string
          id: string
          mastery_level: string | null
          notes: string | null
          performance_year: number | null
          role_id: string | null
          updated_at: string
          venue: string | null
          work_id: string
          years_experience: number | null
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          id?: string
          mastery_level?: string | null
          notes?: string | null
          performance_year?: number | null
          role_id?: string | null
          updated_at?: string
          venue?: string | null
          work_id: string
          years_experience?: number | null
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          id?: string
          mastery_level?: string | null
          notes?: string | null
          performance_year?: number | null
          role_id?: string | null
          updated_at?: string
          venue?: string | null
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
      blog_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time: number | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time?: number | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: []
      }
      candidate_scores: {
        Row: {
          application_id: string
          comments: string | null
          created_at: string
          criteria_id: string
          id: string
          score: number
          scored_by: string
          updated_at: string
        }
        Insert: {
          application_id: string
          comments?: string | null
          created_at?: string
          criteria_id: string
          id?: string
          score: number
          scored_by: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          comments?: string | null
          created_at?: string
          criteria_id?: string
          id?: string
          score?: number
          scored_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_candidate_scores_application"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_candidate_scores_criteria"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "custom_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_favorites: {
        Row: {
          artist_profile_id: string
          casting_id: string
          created_at: string
          id: string
        }
        Insert: {
          artist_profile_id: string
          casting_id: string
          created_at?: string
          id?: string
        }
        Update: {
          artist_profile_id?: string
          casting_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "casting_favorites_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casting_favorites_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_invitations: {
        Row: {
          artist_profile_id: string
          casting_id: string
          created_at: string
          id: string
          message: string
          professional_profile_id: string
          responded_at: string | null
          status: string
          viewed_at: string | null
        }
        Insert: {
          artist_profile_id: string
          casting_id: string
          created_at?: string
          id?: string
          message: string
          professional_profile_id: string
          responded_at?: string | null
          status?: string
          viewed_at?: string | null
        }
        Update: {
          artist_profile_id?: string
          casting_id?: string
          created_at?: string
          id?: string
          message?: string
          professional_profile_id?: string
          responded_at?: string | null
          status?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casting_invitations_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casting_invitations_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casting_invitations_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      casting_roles: {
        Row: {
          casting_id: string
          created_at: string
          description: string | null
          id: string
          is_lead_role: boolean | null
          quantity_needed: number | null
          role_name: string
          voice_type: string | null
        }
        Insert: {
          casting_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_lead_role?: boolean | null
          quantity_needed?: number | null
          role_name: string
          voice_type?: string | null
        }
        Update: {
          casting_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_lead_role?: boolean | null
          quantity_needed?: number | null
          role_name?: string
          voice_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casting_roles_casting_id_fkey"
            columns: ["casting_id"]
            isOneToOne: false
            referencedRelation: "castings"
            referencedColumns: ["id"]
          },
        ]
      }
      castings: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          application_deadline: string | null
          audition_date: string | null
          audition_location: string | null
          compensation_amount: number | null
          compensation_type: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          org_id: string | null
          production_type: string
          professional_profile_id: string
          repertoire_requirements: string[] | null
          required_experience_level: string[] | null
          required_languages: string[] | null
          required_voice_types: string[] | null
          results_published: boolean | null
          specific_requirements: string | null
          start_date: string | null
          tenant_id: string | null
          title: string
          updated_at: string
          venue: string | null
          view_count: number | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          application_deadline?: string | null
          audition_date?: string | null
          audition_location?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          org_id?: string | null
          production_type: string
          professional_profile_id: string
          repertoire_requirements?: string[] | null
          required_experience_level?: string[] | null
          required_languages?: string[] | null
          required_voice_types?: string[] | null
          results_published?: boolean | null
          specific_requirements?: string | null
          start_date?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string
          venue?: string | null
          view_count?: number | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          application_deadline?: string | null
          audition_date?: string | null
          audition_location?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          org_id?: string | null
          production_type?: string
          professional_profile_id?: string
          repertoire_requirements?: string[] | null
          required_experience_level?: string[] | null
          required_languages?: string[] | null
          required_voice_types?: string[] | null
          results_published?: boolean | null
          specific_requirements?: string | null
          start_date?: string | null
          tenant_id?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "castings_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "castings_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "castings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      composers: {
        Row: {
          biography: string | null
          birth_year: number | null
          complete_name: string | null
          created_at: string
          death_year: number | null
          epoch: string | null
          id: string
          name: string
          openopus_id: string | null
          portrait_url: string | null
          updated_at: string
        }
        Insert: {
          biography?: string | null
          birth_year?: number | null
          complete_name?: string | null
          created_at?: string
          death_year?: number | null
          epoch?: string | null
          id?: string
          name: string
          openopus_id?: string | null
          portrait_url?: string | null
          updated_at?: string
        }
        Update: {
          biography?: string | null
          birth_year?: number | null
          complete_name?: string | null
          created_at?: string
          death_year?: number | null
          epoch?: string | null
          id?: string
          name?: string
          openopus_id?: string | null
          portrait_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      custom_criteria: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          professional_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          professional_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          professional_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_custom_criteria_professional_profile"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_applications: {
        Row: {
          applied_at: string
          artist_profile_id: string
          created_at: string
          event_id: string
          experience_level: string | null
          id: string
          motivation: string | null
          professional_notes: string | null
          reviewed_at: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applied_at?: string
          artist_profile_id: string
          created_at?: string
          event_id: string
          experience_level?: string | null
          id?: string
          motivation?: string | null
          professional_notes?: string | null
          reviewed_at?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applied_at?: string
          artist_profile_id?: string
          created_at?: string
          event_id?: string
          experience_level?: string | null
          id?: string
          motivation?: string | null
          professional_notes?: string | null
          reviewed_at?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      idempotency_keys: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          key_hash: string
          request_method: string
          request_path: string
          response_body: Json | null
          response_status: number | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash: string
          request_method: string
          request_path: string
          response_body?: Json | null
          response_status?: number | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key_hash?: string
          request_method?: string
          request_path?: string
          response_body?: Json | null
          response_status?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "idempotency_keys_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string
          currency: string
          description: string | null
          due_date: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_number: string | null
          invoice_pdf: string | null
          is_test_mode: boolean
          period_end: string | null
          period_start: string | null
          status: string
          stripe_customer_id: string
          stripe_invoice_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_due: number
          amount_paid: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf?: string | null
          is_test_mode?: boolean
          period_end?: string | null
          period_start?: string | null
          status: string
          stripe_customer_id: string
          stripe_invoice_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string
          currency?: string
          description?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf?: string | null
          is_test_mode?: boolean
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_invoice_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lyrical_works: {
        Row: {
          acts_count: number | null
          catalogue_number: string | null
          category: string
          composer: string
          composer_id: string | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          external_urls: Json | null
          genre: string | null
          historical_context: string | null
          id: string
          language: string | null
          librettist: string | null
          openopus_id: string | null
          openopus_work_id: string | null
          performance_notes: string | null
          period: string | null
          premiere_date: string | null
          premiere_venue: string | null
          recommended_recording: string | null
          synopsis: string | null
          title: string
          total_duration_minutes: number | null
          updated_at: string
        }
        Insert: {
          acts_count?: number | null
          catalogue_number?: string | null
          category: string
          composer: string
          composer_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          external_urls?: Json | null
          genre?: string | null
          historical_context?: string | null
          id?: string
          language?: string | null
          librettist?: string | null
          openopus_id?: string | null
          openopus_work_id?: string | null
          performance_notes?: string | null
          period?: string | null
          premiere_date?: string | null
          premiere_venue?: string | null
          recommended_recording?: string | null
          synopsis?: string | null
          title: string
          total_duration_minutes?: number | null
          updated_at?: string
        }
        Update: {
          acts_count?: number | null
          catalogue_number?: string | null
          category?: string
          composer?: string
          composer_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          external_urls?: Json | null
          genre?: string | null
          historical_context?: string | null
          id?: string
          language?: string | null
          librettist?: string | null
          openopus_id?: string | null
          openopus_work_id?: string | null
          performance_notes?: string | null
          period?: string | null
          premiere_date?: string | null
          premiere_venue?: string | null
          recommended_recording?: string | null
          synopsis?: string | null
          title?: string
          total_duration_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lyrical_works_composer_id_fkey"
            columns: ["composer_id"]
            isOneToOne: false
            referencedRelation: "composers"
            referencedColumns: ["id"]
          },
        ]
      }
      mail_drafts: {
        Row: {
          attachment_urls: string[] | null
          content: string | null
          created_at: string
          id: string
          recipient_id: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content?: string | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mail_messages: {
        Row: {
          attachment_urls: string[] | null
          content: string
          created_at: string
          id: string
          is_deleted_by_recipient: boolean
          is_deleted_by_sender: boolean
          is_read: boolean
          is_starred: boolean
          read_at: string | null
          recipient_id: string
          reply_to_id: string | null
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_deleted_by_recipient?: boolean
          is_deleted_by_sender?: boolean
          is_read?: boolean
          is_starred?: boolean
          read_at?: string | null
          recipient_id: string
          reply_to_id?: string | null
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_deleted_by_recipient?: boolean
          is_deleted_by_sender?: boolean
          is_read?: boolean
          is_starred?: boolean
          read_at?: string | null
          recipient_id?: string
          reply_to_id?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mail_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "mail_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_applications: boolean | null
          email_events: boolean | null
          email_marketing: boolean | null
          email_messages: boolean | null
          id: string
          in_app_applications: boolean | null
          in_app_events: boolean | null
          in_app_messages: boolean | null
          push_applications: boolean | null
          push_events: boolean | null
          push_messages: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_applications?: boolean | null
          email_events?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          id?: string
          in_app_applications?: boolean | null
          in_app_events?: boolean | null
          in_app_messages?: boolean | null
          push_applications?: boolean | null
          push_events?: boolean | null
          push_messages?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_applications?: boolean | null
          email_events?: boolean | null
          email_marketing?: boolean | null
          email_messages?: boolean | null
          id?: string
          in_app_applications?: boolean | null
          in_app_events?: boolean | null
          in_app_messages?: boolean | null
          push_applications?: boolean | null
          push_events?: boolean | null
          push_messages?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      opera_analytics: {
        Row: {
          action_type: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      opera_productions: {
        Row: {
          cast_info: Json | null
          city: string | null
          conductor: string | null
          costume_designer: string | null
          country: string | null
          created_at: string | null
          director: string | null
          id: string
          images: Json | null
          is_notable: boolean | null
          production_date: string | null
          production_notes: string | null
          reviews_summary: string | null
          stage_designer: string | null
          title: string
          venue: string | null
          work_id: string
        }
        Insert: {
          cast_info?: Json | null
          city?: string | null
          conductor?: string | null
          costume_designer?: string | null
          country?: string | null
          created_at?: string | null
          director?: string | null
          id?: string
          images?: Json | null
          is_notable?: boolean | null
          production_date?: string | null
          production_notes?: string | null
          reviews_summary?: string | null
          stage_designer?: string | null
          title: string
          venue?: string | null
          work_id: string
        }
        Update: {
          cast_info?: Json | null
          city?: string | null
          conductor?: string | null
          costume_designer?: string | null
          country?: string | null
          created_at?: string | null
          director?: string | null
          id?: string
          images?: Json | null
          is_notable?: boolean | null
          production_date?: string | null
          production_notes?: string | null
          reviews_summary?: string | null
          stage_designer?: string | null
          title?: string
          venue?: string | null
          work_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opera_productions_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "lyrical_works"
            referencedColumns: ["id"]
          },
        ]
      }
      opera_recordings: {
        Row: {
          aria_id: string | null
          conductor: string | null
          created_at: string | null
          duration_seconds: number | null
          external_url: string | null
          file_path: string | null
          id: string
          is_featured: boolean | null
          language: string | null
          orchestra: string | null
          performer_name: string | null
          platform: string | null
          quality: string | null
          recording_type: string | null
          recording_year: number | null
          title: string
          view_count: number | null
          work_id: string | null
        }
        Insert: {
          aria_id?: string | null
          conductor?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          orchestra?: string | null
          performer_name?: string | null
          platform?: string | null
          quality?: string | null
          recording_type?: string | null
          recording_year?: number | null
          title: string
          view_count?: number | null
          work_id?: string | null
        }
        Update: {
          aria_id?: string | null
          conductor?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_featured?: boolean | null
          language?: string | null
          orchestra?: string | null
          performer_name?: string | null
          platform?: string | null
          quality?: string | null
          recording_type?: string | null
          recording_year?: number | null
          title?: string
          view_count?: number | null
          work_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opera_recordings_aria_id_fkey"
            columns: ["aria_id"]
            isOneToOne: false
            referencedRelation: "arias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opera_recordings_work_id_fkey"
            columns: ["work_id"]
            isOneToOne: false
            referencedRelation: "lyrical_works"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          payment_type: string
          related_id: string | null
          status: string
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_type: string
          related_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          payment_type?: string
          related_id?: string | null
          status?: string
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      premium_visibility_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          profile_id: string
          profile_type: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          profile_id: string
          profile_type: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          profile_id?: string
          profile_type?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      professional_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string | null
          id: string
          is_available: boolean | null
          notes: string | null
          professional_profile_id: string
          start_time: string | null
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          professional_profile_id: string
          start_time?: string | null
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          professional_profile_id?: string
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_contacts: {
        Row: {
          artist_profile_id: string
          created_at: string
          id: string
          message: string
          professional_profile_id: string
          replied_at: string | null
          status: string
          subject: string
          viewed_at: string | null
        }
        Insert: {
          artist_profile_id: string
          created_at?: string
          id?: string
          message: string
          professional_profile_id: string
          replied_at?: string | null
          status?: string
          subject: string
          viewed_at?: string | null
        }
        Update: {
          artist_profile_id?: string
          created_at?: string
          id?: string
          message?: string
          professional_profile_id?: string
          replied_at?: string | null
          status?: string
          subject?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_contacts_artist_profile_id_fkey"
            columns: ["artist_profile_id"]
            isOneToOne: false
            referencedRelation: "artist_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_contacts_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_events: {
        Row: {
          address: string | null
          cancellation_policy: string | null
          category_id: string | null
          code_of_conduct: string | null
          contact_info: string | null
          created_at: string
          currency: string | null
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          image_url: string | null
          is_featured: boolean | null
          latitude: number | null
          liability_waiver: string | null
          location: string | null
          longitude: number | null
          max_participants: number | null
          org_id: string | null
          participation_rules: string | null
          price: number | null
          professional_profile_id: string
          program: string | null
          registration_deadline: string | null
          requirements: string | null
          results_published: boolean | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          tenant_id: string | null
          title: string
          updated_at: string
          venue: string | null
          venue_id: string | null
        }
        Insert: {
          address?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          code_of_conduct?: string | null
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          liability_waiver?: string | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          org_id?: string | null
          participation_rules?: string | null
          price?: number | null
          professional_profile_id: string
          program?: string | null
          registration_deadline?: string | null
          requirements?: string | null
          results_published?: boolean | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          tenant_id?: string | null
          title: string
          updated_at?: string
          venue?: string | null
          venue_id?: string | null
        }
        Update: {
          address?: string | null
          cancellation_policy?: string | null
          category_id?: string | null
          code_of_conduct?: string | null
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          latitude?: number | null
          liability_waiver?: string | null
          location?: string | null
          longitude?: number | null
          max_participants?: number | null
          org_id?: string | null
          participation_rules?: string | null
          price?: number | null
          professional_profile_id?: string
          program?: string | null
          registration_deadline?: string | null
          requirements?: string | null
          results_published?: boolean | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          tenant_id?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_professional_events_professional_profile_id"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_events_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_media: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_active: boolean | null
          media_type: string
          mime_type: string | null
          professional_profile_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          media_type: string
          mime_type?: string | null
          professional_profile_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_active?: boolean | null
          media_type?: string
          mime_type?: string | null
          professional_profile_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_media_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          bio: string | null
          company_name: string | null
          contact_email: string | null
          created_at: string
          created_by_admin: string | null
          id: string
          intervention_radius: number | null
          is_active: boolean | null
          is_free_account: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          phone: string | null
          premium_subscription_end: string | null
          professional_role: Database["public"]["Enums"]["professional_role"]
          public_visibility_premium: boolean | null
          social_links: Json | null
          team_description: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          created_by_admin?: string | null
          id?: string
          intervention_radius?: number | null
          is_active?: boolean | null
          is_free_account?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          premium_subscription_end?: string | null
          professional_role: Database["public"]["Enums"]["professional_role"]
          public_visibility_premium?: boolean | null
          social_links?: Json | null
          team_description?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          created_by_admin?: string | null
          id?: string
          intervention_radius?: number | null
          is_active?: boolean | null
          is_free_account?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          premium_subscription_end?: string | null
          professional_role?: Database["public"]["Enums"]["professional_role"]
          public_visibility_premium?: boolean | null
          social_links?: Json | null
          team_description?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_target_profiles: {
        Row: {
          age_range_max: number | null
          age_range_min: number | null
          created_at: string
          experience_levels: string[] | null
          id: string
          languages: string[] | null
          professional_profile_id: string
          target_type: string
          voice_types: string[] | null
        }
        Insert: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          experience_levels?: string[] | null
          id?: string
          languages?: string[] | null
          professional_profile_id: string
          target_type: string
          voice_types?: string[] | null
        }
        Update: {
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string
          experience_levels?: string[] | null
          id?: string
          languages?: string[] | null
          professional_profile_id?: string
          target_type?: string
          voice_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_target_profiles_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          profile_type: string
          session_id: string | null
          user_agent: string | null
          viewed_profile_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          profile_type: string
          session_id?: string | null
          user_agent?: string | null
          viewed_profile_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          profile_type?: string
          session_id?: string | null
          user_agent?: string | null
          viewed_profile_id?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          id: string
          is_alert_enabled: boolean | null
          name: string
          professional_profile_id: string
          search_criteria: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_alert_enabled?: boolean | null
          name: string
          professional_profile_id: string
          search_criteria: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_alert_enabled?: boolean | null
          name?: string
          professional_profile_id?: string
          search_criteria?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sheet_music: {
        Row: {
          aria_id: string
          arrangement_type: string | null
          created_at: string | null
          edition: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_public_domain: boolean | null
          original_key: string | null
          price_cents: number | null
          publisher: string | null
          title: string
          transposed_key: string | null
        }
        Insert: {
          aria_id: string
          arrangement_type?: string | null
          created_at?: string | null
          edition?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public_domain?: boolean | null
          original_key?: string | null
          price_cents?: number | null
          publisher?: string | null
          title: string
          transposed_key?: string | null
        }
        Update: {
          aria_id?: string
          arrangement_type?: string | null
          created_at?: string | null
          edition?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_public_domain?: boolean | null
          original_key?: string | null
          price_cents?: number | null
          publisher?: string | null
          title?: string
          transposed_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sheet_music_aria_id_fkey"
            columns: ["aria_id"]
            isOneToOne: false
            referencedRelation: "arias"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          id: string
          is_active: boolean | null
          limitations: Json | null
          name: string
          price_monthly: number
          stripe_price_id: string | null
          trial_days: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limitations?: Json | null
          name: string
          price_monthly: number
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          limitations?: Json | null
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
          trial_days?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          permissions: Json | null
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json | null
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      translation_keys: {
        Row: {
          context: string | null
          created_at: string
          french_text: string
          id: string
          key_path: string
          section: string
          updated_at: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          french_text: string
          id?: string
          key_path: string
          section: string
          updated_at?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          french_text?: string
          id?: string
          key_path?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      translation_suggestions: {
        Row: {
          ai_confidence: number | null
          context_used: string | null
          created_at: string
          id: string
          key_id: string
          language_code: string
          status: string | null
          suggested_text: string
        }
        Insert: {
          ai_confidence?: number | null
          context_used?: string | null
          created_at?: string
          id?: string
          key_id: string
          language_code: string
          status?: string | null
          suggested_text: string
        }
        Update: {
          ai_confidence?: number | null
          context_used?: string | null
          created_at?: string
          id?: string
          key_id?: string
          language_code?: string
          status?: string | null
          suggested_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_suggestions_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "translation_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          is_ai_generated: boolean | null
          is_reviewed: boolean | null
          key_id: string
          language_code: string
          translated_by: string | null
          translated_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_reviewed?: boolean | null
          key_id: string
          language_code: string
          translated_by?: string | null
          translated_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_ai_generated?: boolean | null
          is_reviewed?: boolean | null
          key_id?: string
          language_code?: string
          translated_by?: string | null
          translated_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "translation_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrade_requests: {
        Row: {
          created_at: string
          id: string
          payment_link: string | null
          profile_id: string
          profile_type: string
          requested_by: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          payment_link?: string | null
          profile_id: string
          profile_type: string
          requested_by: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          payment_link?: string | null
          profile_id?: string
          profile_type?: string
          requested_by?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          created_at: string
          documents: Json | null
          id: string
          notes: string | null
          profile_id: string
          profile_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          profile_id: string
          profile_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          profile_id?: string
          profile_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number | null
          created_at: string | null
          delivered_at: string | null
          endpoint_id: string | null
          error_message: string | null
          event_type: string
          id: string
          idempotency_key: string | null
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_code: number | null
          status: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          idempotency_key?: string | null
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_code?: number | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          endpoint_id?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string | null
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_code?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_endpoint_id_fkey"
            columns: ["endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string | null
          description: string | null
          events: Json | null
          failure_count: number | null
          id: string
          is_active: boolean | null
          last_delivery_at: string | null
          max_retries: number | null
          retry_delay_seconds: number | null
          secret: string | null
          tenant_id: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          events?: Json | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          max_retries?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          events?: Json | null
          failure_count?: number | null
          id?: string
          is_active?: boolean | null
          last_delivery_at?: string | null
          max_retries?: number | null
          retry_delay_seconds?: number | null
          secret?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_endpoints_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      work_roles: {
        Row: {
          aria_title: string | null
          created_at: string
          description: string | null
          difficulty_level: number | null
          id: string
          role_name: string
          role_type: string | null
          tessitura_max: string | null
          tessitura_min: string | null
          vocal_characteristics: string | null
          voice_type: string | null
          work_id: string
        }
        Insert: {
          aria_title?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          role_name: string
          role_type?: string | null
          tessitura_max?: string | null
          tessitura_min?: string | null
          vocal_characteristics?: string | null
          voice_type?: string | null
          work_id: string
        }
        Update: {
          aria_title?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: number | null
          id?: string
          role_name?: string
          role_type?: string | null
          tessitura_max?: string | null
          tessitura_min?: string | null
          vocal_characteristics?: string | null
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
      cleanup_expired_idempotency_keys: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification_system: {
        Args: {
          p_content: string
          p_data?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_results_notifications: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: undefined
      }
      current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      delete_user_completely: {
        Args: { user_id_to_delete: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_casting_views: {
        Args: { casting_id: string }
        Returns: undefined
      }
      reset_rate_limit_windows: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      user_can_access_conversation: {
        Args: { conversation_id: string; user_id: string }
        Returns: boolean
      }
      user_has_tenant_access: {
        Args: { p_tenant_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "waitlisted"
      event_status: "draft" | "published" | "cancelled" | "completed"
      event_type:
        | "masterclass"
        | "stage"
        | "concours"
        | "atelier"
        | "conference"
      notification_type:
        | "message"
        | "casting_application"
        | "event_registration"
        | "profile_view"
        | "casting_update"
        | "event_update"
        | "system"
        | "invitation"
      professional_role:
        | "casting_director"
        | "vocal_coach"
        | "conductor"
        | "opera_house_manager"
        | "voice_teacher"
        | "artistic_agent"
        | "producer"
        | "competition_director"
      user_role: "admin" | "user"
      user_type: "artist" | "professional"
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
    Enums: {
      application_status: ["pending", "accepted", "rejected", "waitlisted"],
      event_status: ["draft", "published", "cancelled", "completed"],
      event_type: ["masterclass", "stage", "concours", "atelier", "conference"],
      notification_type: [
        "message",
        "casting_application",
        "event_registration",
        "profile_view",
        "casting_update",
        "event_update",
        "system",
        "invitation",
      ],
      professional_role: [
        "casting_director",
        "vocal_coach",
        "conductor",
        "opera_house_manager",
        "voice_teacher",
        "artistic_agent",
        "producer",
        "competition_director",
      ],
      user_role: ["admin", "user"],
      user_type: ["artist", "professional"],
    },
  },
} as const
