
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';
import { fictionalArtists } from '@/data/fictionalArtists';

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

      const realArtists = data as Artist[];
      
      // Mixer les artistes réels et fictifs
      const allArtists = [...realArtists, ...fictionalArtists];
      
      // Appliquer les filtres côté client pour les artistes fictifs
      let filteredFictionalArtists = fictionalArtists;
      
      if (filters?.searchTerm) {
        filteredFictionalArtists = fictionalArtists.filter(artist =>
          artist.stage_name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          (artist.voice_type && artist.voice_type.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
          (artist.location && artist.location.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
          (artist.bio && artist.bio.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
        );
      }
      
      if (filters?.voiceType) {
        filteredFictionalArtists = filteredFictionalArtists.filter(artist =>
          artist.voice_type === filters.voiceType
        );
      }
      
      if (filters?.location) {
        filteredFictionalArtists = filteredFictionalArtists.filter(artist =>
          artist.location && artist.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      
      // Filtrage par répertoire pour les artistes fictifs
      if (filters?.repertoire && (filters.repertoire.composer || filters.repertoire.category)) {
        filteredFictionalArtists = filteredFictionalArtists.filter(artist => {
          if (!artist.repertoire) return false;
          
          if (filters.repertoire!.composer) {
            return artist.repertoire.some(work =>
              work.toLowerCase().includes(filters.repertoire!.composer!.toLowerCase())
            );
          }
          
          // Pour les catégories, on peut faire une correspondance simple basée sur les noms des œuvres
          if (filters.repertoire!.category) {
            const categoryMap: Record<string, string[]> = {
              'Opéra': ['Traviata', 'Carmen', 'Tosca', 'Rigoletto', 'Faust', 'Bohème'],
              'Oratorio': ['Messiah', 'Passion', 'Requiem'],
              'Mélodie': ['mélodie', 'lied', 'song']
            };
            
            const keywords = categoryMap[filters.repertoire!.category] || [];
            return artist.repertoire.some(work =>
              keywords.some(keyword => work.toLowerCase().includes(keyword.toLowerCase()))
            );
          }
          
          return true;
        });
      }
      
      // Combiner les artistes réels filtrés avec les artistes fictifs filtrés
      const finalResult = [...realArtists, ...filteredFictionalArtists];
      
      return finalResult;
    },
  });

  return {
    artists: artists || [],
    isLoading,
    error,
  };
};
