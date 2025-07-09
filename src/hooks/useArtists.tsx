
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
}

export const useArtists = (filters?: RepertoireFilters) => {
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
          repertoire
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Si nous avons des filtres de répertoire, nous devons joindre avec artist_repertoire
      if (filters && (filters.workId || filters.composer || filters.category || filters.period || filters.masteryLevel)) {
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

        if (filters.workId) {
          repertoireQuery = repertoireQuery.eq('work_id', filters.workId);
        }
        
        if (filters.composer) {
          repertoireQuery = repertoireQuery.ilike('lyrical_works.composer', `%${filters.composer}%`);
        }
        
        if (filters.category) {
          repertoireQuery = repertoireQuery.eq('lyrical_works.category', filters.category);
        }
        
        if (filters.period) {
          repertoireQuery = repertoireQuery.eq('lyrical_works.period', filters.period);
        }
        
        if (filters.masteryLevel) {
          // Filtrer par niveau de maîtrise minimum
          const masteryOrder = ['beginner', 'intermediate', 'advanced', 'expert'];
          const minIndex = masteryOrder.indexOf(filters.masteryLevel);
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

      // Appliquer le filtre de type de voix si spécifié
      if (filters?.voiceType) {
        query = query.eq('voice_type', filters.voiceType);
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
