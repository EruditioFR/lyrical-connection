
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EventWithRules } from '@/types/event';

export const useEventDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['eventDetail', id],
    queryFn: async (): Promise<EventWithRules | null> => {
      if (!id) {
        console.error('❌ No event ID provided');
        throw new Error('Event ID is required');
      }
      
      console.log('🔍 Fetching event with ID:', id);
      
      // First get the event
      const { data: eventData, error: eventError } = await supabase
        .from('professional_events')
        .select(`
          *,
          category:event_categories(*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (eventError) {
        console.error('❌ Error fetching event:', eventError);
        throw eventError;
      }

      if (!eventData) {
        console.log('⚠️ No event found for ID:', id);
        return null;
      }

      // Then get the professional profile separately
      const { data: professionalProfile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('id', eventData.professional_profile_id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching professional profile:', profileError);
        // Don't throw error here, just log it and continue without profile data
      }

      const result: EventWithRules = {
        ...eventData,
        professional_profile: professionalProfile
      };

      console.log('✅ Event data retrieved:', result);
      return result;
    },
    enabled: !!id,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useEventApplicationsCount = (id: string | undefined) => {
  return useQuery({
    queryKey: ['eventApplicationsCount', id],
    queryFn: async () => {
      if (!id) return 0;
      
      const { count, error } = await supabase
        .from('event_applications')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', id);

      if (error) {
        console.error('❌ Error fetching applications count:', error);
        throw error;
      }
      return count || 0;
    },
    enabled: !!id,
  });
};
