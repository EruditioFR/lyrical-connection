
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export interface Venue extends Tables<'venues'> {}

export interface CreateVenueData {
  name: string;
  city?: string;
  country?: string;
  type?: string;
}

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

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venueData: CreateVenueData): Promise<Venue> => {
      console.log('Creating venue with data:', venueData);
      
      const { data, error } = await supabase
        .from('venues')
        .insert(venueData)
        .select()
        .single();

      if (error) {
        console.error('Error creating venue:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('Venue created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
    onError: (error: any) => {
      console.error('Error creating venue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le lieu',
        variant: 'destructive',
      });
    },
  });
};
