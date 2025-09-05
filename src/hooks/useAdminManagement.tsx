import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useAdminManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer tous les comptes (gratuits et payants) créés par des admins ou par inscription normale
  const { data: allAccounts, isLoading: isLoadingAllAccounts } = useQuery({
    queryKey: ['all-accounts'],
    queryFn: async () => {
      const { data: artistProfiles, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: professionalProfiles, error: professionalError } = await supabase
        .from('professional_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (artistError || professionalError) {
        throw artistError || professionalError;
      }

      return {
        artists: artistProfiles || [],
        professionals: professionalProfiles || [],
      };
    },
    enabled: !!user,
  });

  // Récupérer tous les comptes gratuits créés par des admins (pour compatibilité)
  const { data: freeAccounts, isLoading: isLoadingFreeAccounts } = useQuery({
    queryKey: ['free-accounts'],
    queryFn: async () => {
      const { data: artistProfiles, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('is_free_account', true);

      const { data: professionalProfiles, error: professionalError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('is_free_account', true);

      if (artistError || professionalError) {
        throw artistError || professionalError;
      }

      return {
        artists: artistProfiles || [],
        professionals: professionalProfiles || [],
      };
    },
    enabled: !!user,
  });

  // Créer un compte artiste gratuit
  const createFreeArtist = useMutation({
    mutationFn: async (artistData: {
      stage_name: string;
      bio?: string;
      voice_type?: string;
      contact_email: string;
      location?: string;
      phone?: string;
      website?: string;
      nationality?: string;
      experience_years?: string;
      access_level?: 'standard' | 'premium';
    }) => {
      console.log('Creating free artist with data:', artistData);
      
      // Préparer les données pour l'edge function
      const profileData = {
        ...artistData,
        experience_years: artistData.experience_years ? parseInt(artistData.experience_years) : undefined,
      };

      const { data, error } = await supabase.functions.invoke('create-free-user', {
        body: {
          type: 'artist', // S'assurer que le type est explicitement 'artist'
          profile_data: profileData,
          created_by: user?.id,
          access_level: artistData.access_level || 'standard',
        },
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      console.log('Free artist created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Artist creation success callback:', data);
      queryClient.invalidateQueries({ queryKey: ['free-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['all-accounts'] });
      toast({
        title: "Compte créé",
        description: "Le compte artiste gratuit a été créé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating free artist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte artiste.",
        variant: "destructive",
      });
    },
  });

  // Créer un compte professionnel gratuit
  const createFreeProfessional = useMutation({
    mutationFn: async (professionalData: {
      company_name: string;
      professional_role: string;
      bio?: string;
      contact_email: string;
      location?: string;
      phone?: string;
      website?: string;
      team_description?: string;
      access_level?: 'standard' | 'premium';
    }) => {
      console.log('Creating free professional with data:', professionalData);
      
      const { data, error } = await supabase.functions.invoke('create-free-user', {
        body: {
          type: 'professional', // S'assurer que le type est explicitement 'professional'
          profile_data: professionalData,
          created_by: user?.id,
          access_level: professionalData.access_level || 'standard',
        },
      });

      if (error) {
        console.error('Error from edge function:', error);
        throw error;
      }
      
      console.log('Free professional created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Professional creation success callback:', data);
      queryClient.invalidateQueries({ queryKey: ['free-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['all-accounts'] });
      toast({
        title: "Compte créé",
        description: "Le compte professionnel gratuit a été créé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating free professional:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le compte professionnel.",
        variant: "destructive",
      });
    },
  });

  // Envoyer une demande de passage en payant
  const sendUpgradeRequest = useMutation({
    mutationFn: async ({ profileId, profileType, userId }: {
      profileId: string;
      profileType: 'artist' | 'professional';
      userId: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('send-upgrade-request', {
        body: {
          profile_id: profileId,
          profile_type: profileType,
          user_id: userId,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade-requests'] });
      toast({
        title: "Demande envoyée",
        description: "La demande de passage en payant a été envoyée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error sending upgrade request:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la demande de passage en payant.",
        variant: "destructive",
      });
    },
  });

  return {
    allAccounts,
    isLoadingAllAccounts,
    freeAccounts,
    isLoadingFreeAccounts,
    createFreeArtist: createFreeArtist.mutate,
    createFreeProfessional: createFreeProfessional.mutate,
    sendUpgradeRequest: sendUpgradeRequest.mutate,
    isCreatingFreeArtist: createFreeArtist.isPending,
    isCreatingFreeProfessional: createFreeProfessional.isPending,
    isSendingUpgradeRequest: sendUpgradeRequest.isPending,
  };
};
