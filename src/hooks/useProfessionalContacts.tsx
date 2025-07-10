
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type ProfessionalContact = Tables<'professional_contacts'>;
type ProfessionalContactInsert = TablesInsert<'professional_contacts'>;

export const useProfessionalContacts = (userType: 'professional' | 'artist') => {
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['professional-contacts', userType],
    queryFn: async () => {
      let query = supabase.from('professional_contacts').select(`
        *,
        artist_profiles (
          stage_name,
          voice_type,
          location,
          profile_image_url
        ),
        professional_profiles (
          company_name,
          logo_url
        )
      `);

      if (userType === 'professional') {
        // Pour les professionnels : contacts envoyés
        const { data: profile } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profile) {
          query = query.eq('professional_profile_id', profile.id);
        }
      } else {
        // Pour les artistes : contacts reçus
        const { data: profile } = await supabase
          .from('artist_profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profile) {
          query = query.eq('artist_profile_id', profile.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    contacts: contacts || [],
    isLoading,
  };
};

export const useSendContact = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contactData: Omit<ProfessionalContactInsert, 'professional_profile_id'>) => {
      // Récupérer le profil professionnel de l'utilisateur connecté
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Profil professionnel requis');
      }

      const { data, error } = await supabase
        .from('professional_contacts')
        .insert({
          ...contactData,
          professional_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé à l'artiste.",
      });
    },
    onError: (error) => {
      console.error('Send contact error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    },
  });
};

export const useMarkContactAsViewed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { data, error } = await supabase
        .from('professional_contacts')
        .update({ 
          status: 'viewed',
          viewed_at: new Date().toISOString()
        })
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error marking contact as viewed:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-contacts'] });
    },
  });
};
