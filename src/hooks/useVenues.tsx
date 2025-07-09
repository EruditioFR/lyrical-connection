
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface Venue extends Tables<'venues'> {}

export const useVenues = (searchTerm?: string) => {
  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('venues')
        .select('*')
        .order('name');

      if (searchTerm && searchTerm.length > 1) {
        query = query.or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching venues:', error);
        throw error;
      }

      return data as Venue[];
    },
    enabled: !searchTerm || searchTerm.length > 1,
  });

  return {
    venues: venues || [],
    isLoading,
    error,
  };
};
