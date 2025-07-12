import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCreateVenue } from '@/hooks/useVenues';

export interface EventCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalEvent {
  id: string;
  professional_profile_id: string;
  category_id?: string;
  title: string;
  description?: string;
  event_type: 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
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
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: EventCategory;
  applications_count?: number;
}

export interface EventApplication {
  id: string;
  event_id: string;
  artist_profile_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'waitlisted';
  motivation?: string;
  experience_level?: string;
  special_requirements?: string;
  professional_notes?: string;
  applied_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  event?: ProfessionalEvent;
  artist_profile?: {
    id: string;
    stage_name: string;
    contact_email?: string;
    voice_type?: string;
  };
}

export interface CreateEventData {
  professional_profile_id: string;
  category_id?: string;
  title: string;
  description?: string;
  event_type: 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference';
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
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
  currency?: string;
  requirements?: string;
  program?: string;
  contact_info?: string;
  image_url?: string;
  is_featured?: boolean;
}

export interface CreateApplicationData {
  event_id: string;
  artist_profile_id: string;
  motivation?: string;
  experience_level?: string;
  special_requirements?: string;
}

// Hook pour récupérer les catégories d'événements
export const useEventCategories = () => {
  return useQuery({
    queryKey: ['eventCategories'],
    queryFn: async (): Promise<EventCategory[]> => {
      const { data, error } = await supabase
        .from('event_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour récupérer les événements publics
export const usePublicEvents = (filters?: {
  event_type?: string;
  category_id?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['publicEvents', filters],
    queryFn: async (): Promise<ProfessionalEvent[]> => {
      let query = supabase
        .from('professional_events')
        .select(`
          *,
          category:event_categories(*),
          professional_profile:professional_profiles(
            id,
            company_name,
            bio,
            location,
            contact_email,
            phone,
            website
          )
        `)
        .eq('status', 'published')
        .gte('end_date', new Date().toISOString())
        .order('start_date');

      if (filters?.event_type && ['masterclass', 'stage', 'concours', 'atelier', 'conference'].includes(filters.event_type)) {
        query = query.eq('event_type', filters.event_type as 'masterclass' | 'stage' | 'concours' | 'atelier' | 'conference');
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data: events, error } = await query;

      if (error) throw error;

      // Récupérer le nombre d'inscriptions pour chaque événement
      const eventsWithCounts = await Promise.all(
        (events || []).map(async (event) => {
          const { count } = await supabase
            .from('event_applications')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            applications_count: count || 0
          };
        })
      );

      return eventsWithCounts;
    },
  });
};

// Hook pour récupérer les événements d'un professionnel
export const useProfessionalEvents = () => {
  return useQuery({
    queryKey: ['professionalEvents'],
    queryFn: async (): Promise<ProfessionalEvent[]> => {
      console.log('Fetching professional events...');
      
      // D'abord, récupérer le profil professionnel de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      // Récupérer le profil professionnel de l'utilisateur
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!professionalProfile) {
        console.log('No professional profile found for user:', user.id);
        return [];
      }

      console.log('Professional profile found:', professionalProfile.id);
      
      // Ensuite, récupérer les événements avec les catégories et le profil professionnel
      const { data: events, error } = await supabase
        .from('professional_events')
        .select(`
          *,
          category:event_categories(*),
          professional_profile:professional_profiles(
            id,
            company_name,
            bio,
            location,
            contact_email,
            phone,
            website
          )
        `)
        .eq('professional_profile_id', professionalProfile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      console.log('Events fetched:', events?.length || 0);

      if (!events || events.length === 0) {
        return [];
      }

      // Ensuite, récupérer le nombre d'inscriptions pour chaque événement
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const { count } = await supabase
            .from('event_applications')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id);

          return {
            ...event,
            applications_count: count || 0
          };
        })
      );

      console.log('Events with counts:', eventsWithCounts);
      return eventsWithCounts;
    },
  });
};

// Hook pour créer/modifier un événement
export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createVenueMutation = useCreateVenue();

  return useMutation({
    mutationFn: async ({ id, ...eventData }: CreateEventData & { id?: string }) => {
      console.log('Creating/updating event with data:', eventData);
      
      // S'assurer que professional_profile_id est défini
      if (!eventData.professional_profile_id) {
        // Récupérer le profil professionnel de l'utilisateur connecté
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('Utilisateur non connecté');
        }

        const { data: professionalProfile, error: profileError } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError || !professionalProfile) {
          console.error('Error fetching professional profile:', profileError);
          throw new Error('Profil professionnel non trouvé');
        }

        eventData.professional_profile_id = professionalProfile.id;
        console.log('Using professional_profile_id:', professionalProfile.id);
      }

      let venueId: string | undefined;

      // Créer un lieu si les informations sont fournies
      if (eventData.venue || eventData.location || eventData.address) {
        try {
          const venueData = {
            name: eventData.venue || eventData.address || 'Lieu sans nom',
            city: eventData.location,
            country: 'France', // Par défaut
            type: 'event_venue',
          };

          const venue = await createVenueMutation.mutateAsync(venueData);
          venueId = venue.id;
          console.log('Venue created with ID:', venueId);
        } catch (venueError) {
          console.error('Error creating venue:', venueError);
          // Continuer sans venue si la création échoue
        }
      }

      // Préparer les données de l'événement avec venue_id
      const eventDataWithVenue = {
        ...eventData,
        venue_id: venueId,
      };
      
      if (id) {
        const { data, error } = await supabase
          .from('professional_events')
          .update(eventDataWithVenue)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating event:', error);
          throw error;
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from('professional_events')
          .insert(eventDataWithVenue)
          .select()
          .single();

        if (error) {
          console.error('Error creating event:', error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('Event saved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['professionalEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      toast({
        title: 'Succès',
        description: 'Événement sauvegardé avec succès',
      });
    },
    onError: (error: any) => {
      console.error('Error saving event:', error);
      const errorMessage = error?.message || 'Impossible de sauvegarder l\'événement';
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook pour les inscriptions d'un artiste
export const useArtistApplications = () => {
  return useQuery({
    queryKey: ['artistApplications'],
    queryFn: async (): Promise<EventApplication[]> => {
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          event:professional_events(*)
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
  });
};

// Hook pour les inscriptions à un événement (pour les professionnels)
export const useEventApplications = (eventId: string) => {
  return useQuery({
    queryKey: ['eventApplications', eventId],
    queryFn: async (): Promise<EventApplication[]> => {
      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          artist_profile:artist_profiles(
            id,
            stage_name,
            contact_email,
            voice_type
          )
        `)
        .eq('event_id', eventId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    },
  });
};

// Hook pour s'inscrire à un événement
export const useApplyToEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationData: CreateApplicationData) => {
      const { data, error } = await supabase
        .from('event_applications')
        .insert(applicationData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artistApplications'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      toast({
        title: 'Succès',
        description: 'Inscription envoyée avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer l\'inscription',
        variant: 'destructive',
      });
    },
  });
};

// Hook pour gérer les inscriptions (pour les professionnels)
export const useManageApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      professionalNotes 
    }: { 
      applicationId: string; 
      status: EventApplication['status'];
      professionalNotes?: string;
    }) => {
      const updateData: any = { 
        status,
        reviewed_at: new Date().toISOString()
      };
      
      if (professionalNotes !== undefined) {
        updateData.professional_notes = professionalNotes;
      }

      const { data, error } = await supabase
        .from('event_applications')
        .update(updateData)
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventApplications'] });
      toast({
        title: 'Succès',
        description: 'Statut de l\'inscription mis à jour',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'inscription',
        variant: 'destructive',
      });
    },
  });
};
