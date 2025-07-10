
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';

export interface Artist {
  id: string;
  stage_name: string;
  voice_type: string | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  is_active: boolean | null;
  experience_years: number | null;
  repertoire: string[] | null;
  contact_email: string | null;
}

interface ArtistFilters {
  searchTerm?: string;
  voiceType?: string;
  location?: string;
  repertoire?: RepertoireFilters;
}

export const useArtists = (filters?: ArtistFilters) => {
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      let query = supabase
        .from('artist_profiles')
        .select(`
          id,
          stage_name,
          voice_type,
          bio,
          location,
          profile_image_url,
          is_active,
          experience_years,
          repertoire,
          contact_email
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Apply search term filter
      if (filters?.searchTerm) {
        query = query.ilike('stage_name', `%${filters.searchTerm}%`);
      }

      // Apply voice type filter
      if (filters?.voiceType) {
        query = query.eq('voice_type', filters.voiceType);
      }

      // Apply location filter
      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // If we have repertoire filters, we need to join with artist_repertoire
      if (filters?.repertoire && (filters.repertoire.workId || filters.repertoire.composer || filters.repertoire.category || filters.repertoire.period || filters.repertoire.masteryLevel)) {
        // Construire une requête complexe pour filtrer par répertoire
        let repertoireQuery = supabase
          .from('artist_repertoire')
          .select(`
            artist_profile_id,
            lyrical_works!inner (
              id,
              title,
              composer,
              category,
              period
            ),
            mastery_level
          `);

        if (filters.repertoire.workId) {
          repertoireQuery = repertoireQuery.eq('work_id', filters.repertoire.workId);
        }
        
        if (filters.repertoire.composer) {
          repertoireQuery = repertoireQuery.ilike('lyrical_works.composer', `%${filters.repertoire.composer}%`);
        }
        
        if (filters.repertoire.category) {
          repertoireQuery = repertoireQuery.eq('lyrical_works.category', filters.repertoire.category);
        }
        
        if (filters.repertoire.period) {
          repertoireQuery = repertoireQuery.eq('lyrical_works.period', filters.repertoire.period);
        }
        
        if (filters.repertoire.masteryLevel) {
          // Filtrer par niveau de maîtrise minimum
          const masteryOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
          const minIndex = masteryOrder.indexOf(filters.repertoire.masteryLevel);
          const validLevels = masteryOrder.slice(minIndex);
          repertoireQuery = repertoireQuery.in('mastery_level', validLevels);
        }

        const { data: repertoireData, error: repertoireError } = await repertoireQuery;
        
        if (repertoireError) {
          console.error('Error fetching repertoire data:', repertoireError);
          throw repertoireError;
        }

        // Extraire les IDs des profils d'artistes qui correspondent aux filtres
        const artistIds = repertoireData?.map(item => item.artist_profile_id) || [];
        
        if (artistIds.length === 0) {
          return []; // Aucun artiste ne correspond aux filtres
        }

        // Filtrer la requête principale par ces IDs
        query = query.in('id', artistIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching artists:', error);
        throw error;
      }

      return data as Artist[];
    },
  });

  return {
    artists: artists || [],
    isLoading,
    error,
  };
};
