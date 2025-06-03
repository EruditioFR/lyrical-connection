
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

export const useArtists = () => {
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ['artists'],
    queryFn: async () => {
      const { data, error } = await supabase
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
