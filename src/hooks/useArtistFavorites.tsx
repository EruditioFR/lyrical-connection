import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ArtistFavorite {
  id: string;
  professional_profile_id: string;
  artist_profile_id: string;
  created_at: string;
}

export const useArtistFavorites = (professionalProfileId?: string) => {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['artist-favorites', professionalProfileId],
    queryFn: async (): Promise<ArtistFavorite[]> => {
      if (!professionalProfileId) return [];
      
      const { data, error } = await supabase
        .from('artist_favorites')
        .select('*')
        .eq('professional_profile_id', professionalProfileId);
      
      if (error) throw error;
      return data as ArtistFavorite[];
    },
    enabled: !!professionalProfileId
  });

  const isFavorite = (artistProfileId: string) => {
    return favorites?.some(f => f.artist_profile_id === artistProfileId) || false;
  };

  const toggleFavorite = useMutation({
    mutationFn: async (artistProfileId: string) => {
      if (!professionalProfileId) throw new Error('Professional profile ID required');
      
      const existingFavorite = favorites?.find(f => f.artist_profile_id === artistProfileId);
      
      if (existingFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('artist_favorites')
          .delete()
          .eq('id', existingFavorite.id);
        
        if (error) throw error;
        return { action: 'removed' };
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('artist_favorites')
          .insert({
            professional_profile_id: professionalProfileId,
            artist_profile_id: artistProfileId
          })
          .select()
          .single();
        
        if (error) throw error;
        return { action: 'added', data };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['artist-favorites', professionalProfileId] });
      toast({
        title: result.action === 'added' ? "Ajouté aux favoris" : "Retiré des favoris",
        description: result.action === 'added' 
          ? "L'artiste a été ajouté à vos favoris"
          : "L'artiste a été retiré de vos favoris"
      });
    }
  });

  return {
    favorites: favorites || [],
    isLoading,
    isFavorite,
    toggleFavorite
  };
};