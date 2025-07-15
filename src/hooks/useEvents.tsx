import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Database } from '@/integrations/supabase/types';

type EventStatus = Database['public']['Enums']['event_status'];
type EventType = Database['public']['Enums']['event_type'];

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
}

export interface EventApplication {
  id: string;
  event_id: string;
  artist_profile_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  created_at: string;
  updated_at: string;
  experience_level: string | null;
  motivation: string | null;
  special_requirements: string | null;
  professional_notes: string | null;
  reviewed_at: string | null;
  user_profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useProfessionalEvents = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['professional-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('professional_events')
        .select('*')
        .eq('professional_profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching professional events:', error);
        throw error;
      }

      return data as Event[];
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

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (newEvent: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professional_events')
        .insert([{ ...newEvent, professional_profile_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      return data as Event;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['professional-events', user?.id]);
      },
    }
  );
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (updatedEvent: Event) => {
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
    {
      onSuccess: (_, updatedEvent) => {
        queryClient.invalidateQueries(['professional-events', user?.id]);
        queryClient.invalidateQueries(['event-detail', updatedEvent.id]);
      },
    }
  );
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (eventId: string) => {
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
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['professional-events', user?.id]);
      },
    }
  );
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

      const { data, error } = await supabase
        .from('event_applications')
        .select(`
          *,
          user_profiles:artist_profiles(
            user_profiles(first_name, last_name)
          )
        `)
        .eq('event_id', eventId)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching event applications:', error);
        throw error;
      }

      // Transform the data to flatten user_profiles
      const transformedData = data?.map(app => ({
        ...app,
        user_profiles: app.user_profiles?.user_profiles || null
      })) || [];

      return transformedData as EventApplication[];
    },
    enabled: !!eventId,
  });
};
