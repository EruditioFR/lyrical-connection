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
          production_type: string
          professional_profile_id: string
          repertoire_requirements: string[] | null
          required_experience_level: string[] | null
          required_languages: string[] | null
          required_voice_types: string[] | null
          specific_requirements: string | null
          start_date: string | null
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
          production_type: string
          professional_profile_id: string
          repertoire_requirements?: string[] | null
          required_experience_level?: string[] | null
          required_languages?: string[] | null
          required_voice_types?: string[] | null
          specific_requirements?: string | null
          start_date?: string | null
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
          production_type?: string
          professional_profile_id?: string
          repertoire_requirements?: string[] | null
          required_experience_level?: string[] | null
          required_languages?: string[] | null
          required_voice_types?: string[] | null
          specific_requirements?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
          venue?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "castings_professional_profile_id_fkey"
            columns: ["professional_profile_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          left_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          left_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_archived: boolean | null
          last_message_at: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean | null
          last_message_at?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          message_type: string | null
          reply_to_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
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
          category_id: string | null
          contact_info: string | null
          created_at: string
          currency: string | null
          description: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          max_participants: number | null
          price: number | null
          professional_profile_id: string
          program: string | null
          registration_deadline: string | null
          requirements: string | null
          start_date: string
          status: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          category_id?: string | null
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date: string
          event_type: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          price?: number | null
          professional_profile_id: string
          program?: string | null
          registration_deadline?: string | null
          requirements?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["event_status"]
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          category_id?: string | null
          contact_info?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          end_date?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_participants?: number | null
          price?: number | null
          professional_profile_id?: string
          program?: string | null
          registration_deadline?: string | null
          requirements?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"]
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
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
          id: string
          intervention_radius: number | null
          is_active: boolean | null
          is_verified: boolean | null
          location: string | null
          logo_url: string | null
          phone: string | null
          professional_role: Database["public"]["Enums"]["professional_role"]
          social_links: Json | null
          team_description: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          intervention_radius?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          professional_role: Database["public"]["Enums"]["professional_role"]
          social_links?: Json | null
          team_description?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          company_name?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          intervention_radius?: number | null
          is_active?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          logo_url?: string | null
          phone?: string | null
          professional_role?: Database["public"]["Enums"]["professional_role"]
          social_links?: Json | null
          team_description?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
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
      increment_casting_views: {
        Args: { casting_id: string }
        Returns: undefined
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
      user_type: ["artist", "professional"],
    },
  },
} as const
