
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Application = Tables<'applications'>;
type ApplicationInsert = TablesInsert<'applications'>;
type ApplicationUpdate = TablesUpdate<'applications'>;

export const useApplications = (castingId?: string) => {
  return useQuery({
    queryKey: ['applications', castingId],
    queryFn: async () => {
      let query = supabase
        .from('applications')
        .select(`
          *,
          artist_profiles (
            stage_name,
            profile_image_url,
            voice_type,
            contact_email
          )
        `)
        .order('created_at', { ascending: false });

      if (castingId) {
        query = query.eq('casting_id', castingId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!castingId,
  });
};

export const useCreateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationData: Omit<ApplicationInsert, 'artist_profile_id'>) => {
      // Récupérer le profil artiste de l'utilisateur connecté
      const { data: profile } = await supabase
        .from('artist_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Profil artiste requis');
      }

      const { data, error } = await supabase
        .from('applications')
        .insert({
          ...applicationData,
          artist_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Candidature envoyée",
        description: "Votre candidature a été soumise avec succès.",
      });
    },
    onError: (error) => {
      console.error('Create application error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la candidature. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ApplicationUpdate }) => {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast({
        title: "Candidature mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: (error) => {
      console.error('Update application error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la candidature.",
        variant: "destructive",
      });
    },
  });
};
