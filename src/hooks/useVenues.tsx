
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
      
      // Vérifier si le lieu existe déjà
      const { data: existingVenues, error: searchError } = await supabase
        .from('venues')
        .select('*')
        .ilike('name', venueData.name)
        .eq('city', venueData.city || '')
        .eq('country', venueData.country || '');

      if (searchError) {
        console.error('Error searching for existing venue:', searchError);
        throw searchError;
      }

      // Si un lieu existe déjà, le retourner au lieu d'en créer un nouveau
      if (existingVenues && existingVenues.length > 0) {
        console.log('Venue already exists, returning existing venue:', existingVenues[0]);
        return existingVenues[0] as Venue;
      }

      // Créer le nouveau lieu seulement s'il n'existe pas
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
    onSuccess: (data, variables) => {
      console.log('Venue processed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      
      // Ne pas afficher de toast si c'est un lieu existant
      const isNewVenue = data.created_at === data.updated_at;
      if (isNewVenue) {
        toast({
          title: 'Succès',
          description: 'Lieu créé avec succès',
        });
      }
    },
    onError: (error: any) => {
      console.error('Error processing venue:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter le lieu',
        variant: 'destructive',
      });
    },
  });
};
