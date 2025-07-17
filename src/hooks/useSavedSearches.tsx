
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type SavedSearch = Tables<'saved_searches'>;
type SavedSearchInsert = TablesInsert<'saved_searches'>;

export const useSavedSearches = () => {
  const { toast } = useToast();

  const { data: searches, isLoading } = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved searches:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    searches: searches || [],
    isLoading,
  };
};

export const useSaveSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (searchData: Omit<SavedSearchInsert, 'professional_profile_id'>) => {
      console.log('=== DÉBUT SAUVEGARDE RECHERCHE ===');
      console.log('Search data:', searchData);
      
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User authentication error:', userError);
        throw new Error('Erreur d\'authentification: ' + userError.message);
      }

      if (!user) {
        console.error('❌ No user found');
        throw new Error('Utilisateur non connecté');
      }

      console.log('✅ User authenticated:', user.id, user.email);

      // Récupérer le profil professionnel de l'utilisateur connecté
      console.log('🔍 Searching for professional profile for user:', user.id);
      
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('📊 Profile query result:', { profile, profileError });

      if (profileError) {
        console.error('❌ Database error while fetching profile:', profileError);
        throw new Error('Erreur de base de données: ' + profileError.message);
      }

      if (!profile) {
        console.error('❌ No professional profile found for user:', user.id);
        console.log('📋 Checking if user has any profiles...');
        
        // Vérifier si l'utilisateur a un profil artiste à la place
        const { data: artistProfile } = await supabase
          .from('artist_profiles')
          .select('id, user_id')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (artistProfile) {
          console.log('ℹ️ User has artist profile instead:', artistProfile.id);
          throw new Error('Vous devez avoir un profil professionnel pour sauvegarder des recherches. Vous avez actuellement un profil artiste.');
        }
        
        throw new Error('Aucun profil professionnel trouvé. Veuillez créer un profil professionnel pour sauvegarder vos recherches.');
      }

      console.log('✅ Professional profile found:', profile.id);
      console.log('📄 Profile details:', {
        id: profile.id,
        user_id: profile.user_id,
        professional_role: profile.professional_role,
        is_active: profile.is_active
      });

      // Vérifier que le profil est actif
      if (!profile.is_active) {
        console.warn('⚠️ Professional profile is inactive');
        throw new Error('Votre profil professionnel est inactif. Contactez le support.');
      }

      console.log('💾 Inserting search into database...');
      
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          ...searchData,
          professional_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving search to database:', error);
        throw new Error('Erreur lors de la sauvegarde: ' + error.message);
      }

      console.log('✅ Search saved successfully:', data);
      console.log('=== FIN SAUVEGARDE RECHERCHE ===');
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: "Recherche sauvegardée",
        description: "Vos critères de recherche ont été sauvegardés.",
      });
    },
    onError: (error) => {
      console.error('💥 Save search error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la recherche.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSavedSearch = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (searchId: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', searchId);

      if (error) {
        console.error('Error deleting saved search:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
      toast({
        title: "Recherche supprimée",
        description: "La recherche sauvegardée a été supprimée.",
      });
    },
    onError: (error) => {
      console.error('Delete search error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la recherche.",
        variant: "destructive",
      });
    },
  });
};
