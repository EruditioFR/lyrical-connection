import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Database } from '@/integrations/supabase/types';

type EventStatus = Database['public']['Enums']['event_status'];
type EventType = Database['public']['Enums']['event_type'];
type EventApplicationStatus = Database['public']['Enums']['application_status'];

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  status: EventStatus;
  start_date: string;
  end_date: string;
  location: string | null;
  address: string | null;
  venue: string | null;
  price: number | null;
  currency: string | null;
  max_participants: number | null;
  image_url: string | null;
  professional_profile_id: string;
  created_at: string;
  updated_at: string;
  registration_deadline: string | null;
  requirements: string | null;
  program: string | null;
  contact_info: string | null;
  participation_rules: string | null;
  code_of_conduct: string | null;
  cancellation_policy: string | null;
  liability_waiver: string | null;
  is_featured: boolean | null;
  latitude: number | null;
  longitude: number | null;
  venue_id: string | null;
  category_id: string | null;
  results_published: boolean | null;
  applications_count?: number;
}

// Export alias for backwards compatibility
export type ProfessionalEvent = Event;

export interface EventApplication {
  id: string;
  event_id: string;
  artist_profile_id: string;
  status: EventApplicationStatus;
  applied_at: string;
  created_at: string;
  updated_at: string;
  experience_level: string | null;
  motivation: string | null;
  special_requirements: string | null;
  professional_notes: string | null;
  reviewed_at: string | null;
  artist_profiles?: {
    id: string;
    stage_name: string;
    voice_type: string | null;
    bio: string | null;
    location: string | null;
    profile_image_url: string | null;
    experience_years: number | null;
    gender: string | null;
    nationality: string | null;
    birth_date: string | null;
    contact_email: string | null;
    phone: string | null;
  };
}

export interface EventCategory {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

export interface CreateEventData {
  title: string;
  description: string | null;
  event_type: EventType;
  start_date: string;
  end_date: string;
  location: string | null;
  venue: string | null;
  price: number | null;
  max_participants: number | null;
  requirements: string | null;
  program: string | null;
  contact_info: string | null;
  status?: EventStatus;
  address?: string | null;
  currency?: string | null;
  registration_deadline?: string | null;
  participation_rules?: string | null;
  code_of_conduct?: string | null;
  cancellation_policy?: string | null;
  liability_waiver?: string | null;
  is_featured?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  venue_id?: string | null;
  category_id?: string | null;
  image_url?: string | null;
}

export interface CreateApplicationData {
  event_id: string;
  motivation: string | null;
  experience_level: string | null;
  special_requirements: string | null;
}

export const useProfessionalEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['professional-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // D'abord, récupérer l'ID du profil professionnel
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching professional profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        console.log('No professional profile found for user:', user.id);
        return [];
      }

      // Récupérer les événements
      const { data: events, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('professional_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching professional events:', error);
        throw error;
      }

      if (!events) return [];

      // Pour chaque événement, récupérer le nombre d'inscriptions
      const eventsWithApplicationsCount = await Promise.all(
        events.map(async (event) => {
          const { count, error: countError } = await supabase
            .from('event_applications')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          if (countError) {
            console.error('Error counting applications for event:', event.id, countError);
          }

          return {
            ...event,
            applications_count: count || 0
          };
        })
      );

      return eventsWithApplicationsCount as Event[];
    },
    enabled: !!user?.id,
  });
};

export const useEventDetail = (eventId?: string) => {
  return useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event detail:', error);
        throw error;
      }

      return data as Event;
    },
    enabled: !!eventId,
  });
};

// Export alias for backwards compatibility
export const useProfessionalEvent = useEventDetail;

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newEvent: CreateEventData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // D'abord, récupérer l'ID du profil professionnel
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching professional profile:', profileError);
        throw profileError;
      }

      if (!profile) {
        throw new Error('No professional profile found for user');
      }

      const eventData = {
        ...newEvent,
        professional_profile_id: profile.id,
        status: newEvent.status || 'draft' as EventStatus,
        currency: newEvent.currency || 'EUR',
        is_featured: newEvent.is_featured || false,
      };

      const { data, error } = await supabase
        .from('professional_events')
        .insert([eventData])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      return data as Event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-events', user?.id] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (updatedEvent: Event) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professional_events')
        .update(updatedEvent)
        .eq('id', updatedEvent.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event:', error);
        throw error;
      }

      return data as Event;
    },
    onSuccess: (_, updatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ['professional-events', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-detail', updatedEvent.id] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('professional_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-events', user?.id] });
    },
  });
};

export const usePublicEvents = (filters?: {
  eventType?: string;
  category?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['public-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('professional_events')
        .select(`
          *,
          professional_profiles!inner(company_name, is_verified)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (filters?.eventType && filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType as EventType);
      }

      if (filters?.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching public events:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useEventCategories = () => {
  return useQuery({
    queryKey: ['event-categories'],
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

export const useEventApplicationsCount = (eventId?: string) => {
  return useQuery({
    queryKey: ['event-applications-count', eventId],
    queryFn: async () => {
      if (!eventId) return 0;

      const { count, error } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact' })
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching event applications count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!eventId,
  });
};

export const useEventApplications = (eventId?: string) => {
  return useQuery({
    queryKey: ['event-applications', eventId],
    queryFn: async () => {
      if (!eventId) return [];

      // First get event applications
      const { data: applications, error: appsError } = await supabase
        .from('event_applications')
        .select('*')
        .eq('event_id', eventId)
        .order('applied_at', { ascending: false });

      if (appsError) {
        console.error('Error fetching event applications:', appsError);
        throw appsError;
      }

      if (!applications || applications.length === 0) {
        return [];
      }

      // Get artist profiles for these applications
      const artistProfileIds = applications.map(app => app.artist_profile_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('artist_profiles')
        .select('id, stage_name, voice_type, bio, location, profile_image_url, experience_years, gender, nationality, birth_date, contact_email, phone')
        .in('id', artistProfileIds);

      if (profilesError) {
        console.error('Error fetching artist profiles:', profilesError);
        throw profilesError;
      }

      // Combine the data
      const enrichedApplications = applications.map(app => ({
        ...app,
        artist_profiles: profiles?.find(p => p.id === app.artist_profile_id) || null
      }));

      return enrichedApplications as EventApplication[];
    },
    enabled: !!eventId,
  });
};

export const useApplyToEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (applicationData: CreateApplicationData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Get artist profile
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!artistProfile) {
        throw new Error('Artist profile not found');
      }

      const { data, error } = await supabase
        .from('event_applications')
        .insert([{
          ...applicationData,
          artist_profile_id: artistProfile.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error applying to event:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-applications', variables.event_id] });
      queryClient.invalidateQueries({ queryKey: ['event-applications-count', variables.event_id] });
    },
  });
};

export const useUpdateEventApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: EventApplicationStatus }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['event-applications'] });
      const statusLabels = {
        pending: 'en attente',
        waitlisted: 'présélectionnée',
        accepted: 'acceptée',
        rejected: 'refusée'
      };
      toast({
        title: "Candidature mise à jour",
        description: `La candidature a été ${statusLabels[variables.status]}.`,
      });
    },
    onError: (error) => {
      console.error('Error updating application:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la candidature.",
        variant: "destructive",
      });
    },
  });
};

export const usePublishEventResults = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professional_events')
        .update({ results_published: true })
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        console.error('Error publishing results:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-applications'] });
      toast({
        title: "Résultats publiés",
        description: "Les résultats de l'événement ont été publiés avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error publishing results:', error);
      toast({
        title: "Erreur",
        description: "Impossible de publier les résultats.",
        variant: "destructive",
      });
    },
  });
};
