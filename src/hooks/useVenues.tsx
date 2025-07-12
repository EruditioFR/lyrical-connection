
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venue {
  id: string;
  name: string;
  city?: string;
  country?: string;
  type?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVenueData {
  name: string;
  city?: string;
  country?: string;
  type?: string;
}

// Hook pour récupérer tous les lieux
export const useVenues = () => {
  return useQuery({
    queryKey: ['venues'],
    queryFn: async (): Promise<Venue[]> => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
};

// Hook pour rechercher des lieux
export const useSearchVenues = (searchTerm: string) => {
  return useQuery({
    queryKey: ['venues', 'search', searchTerm],
    queryFn: async (): Promise<Venue[]> => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 2,
  });
};

// Hook pour créer un lieu
export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (venueData: CreateVenueData): Promise<Venue> => {
      console.log('Creating venue with data:', venueData);
      
      // Vérifier si le lieu existe déjà avec une recherche plus précise
      const { data: existingVenues, error: searchError } = await supabase
        .from('venues')
        .select('*')
        .eq('name', venueData.name.trim())
        .eq('city', venueData.city?.trim() || '')
        .eq('country', venueData.country?.trim() || '');

      if (searchError) {
        console.error('Error searching for existing venue:', searchError);
        // Ne pas bloquer la création si la recherche échoue
      }

      // Si un lieu existe déjà, le retourner
      if (existingVenues && existingVenues.length > 0) {
        console.log('Venue already exists, returning existing venue:', existingVenues[0]);
        return existingVenues[0] as Venue;
      }

      // Créer le nouveau lieu
      const { data, error } = await supabase
        .from('venues')
        .insert({
          name: venueData.name.trim(),
          city: venueData.city?.trim() || null,
          country: venueData.country?.trim() || null,
          type: venueData.type || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating venue:', error);
        throw error;
      }

      console.log('New venue created:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      console.log('Venue processed successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      
      // Afficher un toast seulement pour les nouveaux lieux
      // Un lieu existant aura une date de création antérieure
      const now = new Date();
      const createdAt = new Date(data.created_at);
      const isNewVenue = (now.getTime() - createdAt.getTime()) < 5000; // Créé dans les 5 dernières secondes
      
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
        description: 'Impossible de créer le lieu',
        variant: 'destructive',
      });
    },
  });
};
