import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';

export interface Artist {
  id: string;
  user_id: string;
  stage_name: string;
  voice_type: string | null;
  bio: string | null;
  location: string | null;
  profile_image_url: string | null;
  is_active: boolean | null;
  experience_years: number | null;
  repertoire: string[] | null;
  contact_email: string | null;
  phone: string | null;
  website: string | null;
  nationality: string | null;
  public_visibility_premium?: boolean;
  premium_subscription_end?: string | null;
}

interface ArtistFilters {
  searchTerm?: string;
  voiceType?: string;
  location?: string;
  repertoire?: RepertoireFilters;
  isUserAuthenticated?: boolean;
}

export const useArtists = (filters?: ArtistFilters) => {
  const { data: artists, isLoading, error } = useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      // Récupérer les artistes avec les informations d'abonnement
      let query = supabase
        .from('artist_profiles')
        .select(`
          id,
          user_id,
          stage_name,
          voice_type,
          bio,
          location,
          profile_image_url,
          is_active,
          experience_years,
          repertoire,
          contact_email,
          phone,
          website,
          nationality,
          public_visibility_premium,
          premium_subscription_end,
          artist_photos!left (
            file_path,
            is_profile_photo
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: artistsData, error: artistsError } = await query;

      if (artistsError) {
        console.error('Error fetching artists:', artistsError);
        throw artistsError;
      }

      // Récupérer les abonnements premium actifs
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, status, current_period_end')
        .eq('status', 'active');

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
      }

      // Récupérer les abonnements de visibilité premium actifs
      const { data: premiumVisibility, error: premiumVisibilityError } = await supabase
        .from('premium_visibility_subscriptions')
        .select('user_id, status, current_period_end')
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString());

      if (premiumVisibilityError) {
        console.error('Error fetching premium visibility:', premiumVisibilityError);
      }

      // Créer des Sets pour les différents types d'abonnements
      const premiumVisibilityUserIds = new Set(
        (premiumVisibility || []).map(pv => pv.user_id)
      );
      const activeSubscriptionUserIds = new Set(
        (subscriptions || []).map(sub => sub.user_id)
      );

      let filteredArtists = artistsData || [];

      // Filtrer pour ne garder que les artistes ayant un abonnement premium actif
      if (!filters?.isUserAuthenticated) {
        // Utilisateurs non connectés : seuls les artistes avec un abonnement premium actif sont visibles
        filteredArtists = filteredArtists.filter(artist => {
          return activeSubscriptionUserIds.has(artist.user_id) || premiumVisibilityUserIds.has(artist.user_id);
        });
      } else {
        // Utilisateurs connectés : tous les artistes avec un abonnement actif sont visibles
        filteredArtists = filteredArtists.filter(artist => {
          return activeSubscriptionUserIds.has(artist.user_id) || premiumVisibilityUserIds.has(artist.user_id);
        });
      }

      // Apply search term filter
      if (filters?.searchTerm) {
        filteredArtists = filteredArtists.filter(artist =>
          artist.stage_name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          (artist.voice_type && artist.voice_type.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
          (artist.location && artist.location.toLowerCase().includes(filters.searchTerm!.toLowerCase())) ||
          (artist.bio && artist.bio.toLowerCase().includes(filters.searchTerm!.toLowerCase()))
        );
      }

      // Apply voice type filter
      if (filters?.voiceType) {
        filteredArtists = filteredArtists.filter(artist => artist.voice_type === filters.voiceType);
      }

      // Apply location filter
      if (filters?.location) {
        filteredArtists = filteredArtists.filter(artist =>
          artist.location && artist.location.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      // If we have repertoire filters, apply them to the filtered artists
      if (filters?.repertoire && (filters.repertoire.workId || filters.repertoire.composer || filters.repertoire.category || filters.repertoire.period || filters.repertoire.masteryLevel || filters.repertoire.airSearch)) {
        let artistIds: string[] = [];

        // Recherche dans le répertoire traditionnel (lyrical_works)
        if (filters.repertoire.workId || filters.repertoire.composer || filters.repertoire.category || filters.repertoire.period || filters.repertoire.masteryLevel) {
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

          artistIds = [...artistIds, ...(repertoireData?.map(item => item.artist_profile_id) || [])];
        }

        // Recherche dans les airs (artist_airs)
        if (filters.repertoire.airSearch) {
          let airsQuery = supabase
            .from('artist_airs')
            .select('artist_profile_id')
            .eq('is_active', true);

          // Recherche dans le titre et la description des airs
          airsQuery = airsQuery.or(`title.ilike.%${filters.repertoire.airSearch}%,description.ilike.%${filters.repertoire.airSearch}%`);

          const { data: airsData, error: airsError } = await airsQuery;
          
          if (airsError) {
            console.error('Error fetching airs data:', airsError);
            throw airsError;
          }

          artistIds = [...artistIds, ...(airsData?.map(item => item.artist_profile_id) || [])];
        }
        
        // Dédupliquer les IDs d'artistes
        const uniqueArtistIds = [...new Set(artistIds)];
        
        if (uniqueArtistIds.length === 0) {
          return []; // Aucun artiste ne correspond aux filtres
        }

        // Filtrer les artistes premium par ces IDs
        filteredArtists = filteredArtists.filter(artist => uniqueArtistIds.includes(artist.id));
      }

      // Traiter les artistes pour récupérer la photo de profil et marquer les premium
      const realArtists = filteredArtists.map(artist => {
        const profilePhoto = artist.artist_photos?.find((photo: any) => photo.is_profile_photo);
        const profileImageUrl = profilePhoto 
          ? supabase.storage.from('artist-photos').getPublicUrl(profilePhoto.file_path).data.publicUrl
          : artist.profile_image_url;
        
        // Marquer l'artiste comme premium s'il a un abonnement actif
        const hasPremiumVisibility = premiumVisibilityUserIds.has(artist.user_id) || activeSubscriptionUserIds.has(artist.user_id);
        
        return {
          ...artist,
          profile_image_url: profileImageUrl,
          public_visibility_premium: hasPremiumVisibility,
          artist_photos: undefined // Ne pas exposer les photos dans l'interface Artist
        } as Artist;
      });
      
      // Retourner uniquement les artistes réels (plus d'artistes fictifs)
      return realArtists;
    },
  });

  return {
    artists: artists || [],
    isLoading,
    error,
  };
};
