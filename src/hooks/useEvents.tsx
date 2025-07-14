import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface ProfessionalEvent {
  id: string;
  professional_profile_id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: 'draft' | 'published' | 'completed';
  category_id: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  location: string | null;
  venue: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  max_participants: number | null;
  price: number | null;
  currency: string;
  requirements: string | null;
  program: string | null;
  contact_info: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  applications_count?: number;
  category?: EventCategory;
}

export interface EventCategory {
  id: string;
  name: string;
  color: string;
}

export interface PublicEvent {
  id: string;
  professional_profile_id: string;
  title: string;
  description: string | null;
  event_type: string;
  status: 'draft' | 'published' | 'completed';
  category_id: string | null;
  start_date: string;
  end_date: string;
  registration_deadline: string | null;
  location: string | null;
  venue: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  max_participants: number | null;
  price: number | null;
  currency: string;
  requirements: string | null;
  program: string | null;
  contact_info: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  professional_profiles: {
    id: string;
    company_name: string;
  };
  event_categories: {
    id: string;
    name: string;
    color: string;
  };
}

export interface EventApplication {
  id: string;
  user_id: string;
  event_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user_profiles: {
    first_name: string;
    last_name: string;
  };
}

export interface CreateEventData {
  id?: string;
  professional_profile_id: string;
  title: string;
  description?: string;
  event_type: string;
  status: 'draft' | 'published';
  category_id?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  location?: string;
  venue?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  max_participants?: number;
  price?: number;
  currency: string;
  requirements?: string;
  program?: string;
  contact_info?: string;
  image_url?: string;
  participation_rules?: string;
  code_of_conduct?: string;
  cancellation_policy?: string;
  liability_waiver?: string;
}

export interface EventWithRules extends ProfessionalEvent {
  participation_rules: string | null;
  code_of_conduct: string | null;
  cancellation_policy: string | null;
  liability_waiver: string | null;
}

export const useProfessionalEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['professionalEvents', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('professional_events')
        .select(`
          *,
          professional_profiles!inner(
            id,
            company_name,
            user_id
          ),
          event_categories(
            id,
            name,
            color
          ),
          event_applications(
            id,
            status
          )
        `)
        .eq('professional_profiles.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching professional events:', error);
        throw error;
      }

      return data?.map(event => ({
        ...event,
        applications_count: event.event_applications?.length || 0,
        category: event.event_categories
      })) || [];
    },
    enabled: !!user,
  });
};

export const useProfessionalEvent = (eventId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['professionalEvent', eventId, user?.id],
    queryFn: async () => {
      if (!user || !eventId) return null;

      const { data, error } = await supabase
        .from('professional_events')
        .select(`
          *,
          professional_profiles!inner(
            id,
            company_name,
            user_id
          ),
          event_categories(
            id,
            name,
            color
          )
        `)
        .eq('id', eventId)
        .eq('professional_profiles.user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching professional event:', error);
        throw error;
      }

      return {
        ...data,
        category: data.event_categories
      };
    },
    enabled: !!user && !!eventId,
  });
};

export const usePublicEvents = () => {
  return useQuery({
    queryKey: ['publicEvents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professional_events')
        .select(`
          *,
          professional_profiles (
            id,
            company_name
          ),
          event_categories (
            id,
            name,
            color
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public events:', error);
        throw error;
      }

      return data as PublicEvent[];
    },
  });
};

export const useEventDetail = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ['eventDetail', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('professional_events')
        .select(`
          *,
          professional_profiles (
            id,
            company_name
          ),
          event_categories (
            id,
            name,
            color
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event detail:', error);
        throw error;
      }

      return data as PublicEvent;
    },
    enabled: !!eventId,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      const { data, error } = await supabase
        .from('professional_events')
        .upsert(eventData)
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating event:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      toast({
        title: 'Succès',
        description: `Événement ${data.status === 'published' ? 'publié' : 'sauvegardé'} avec succès`,
      });
    },
    onError: (error) => {
      console.error('Error in createEvent mutation:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'événement',
        variant: 'destructive',
      });
    }
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: ['eventCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching event categories:', error);
        throw error;
      }

      return data as EventCategory[];
    },
  });
};

export const useEventApplications = (eventId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['eventApplications', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          user_profiles (
            first_name,
            last_name
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching event applications:', error);
        throw error;
      }

      return data as EventApplication[];
    },
    enabled: !!eventId,
  });
};
