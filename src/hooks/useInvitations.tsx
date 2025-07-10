
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type CastingInvitation = Tables<'casting_invitations'>;
type CastingInvitationInsert = TablesInsert<'casting_invitations'>;

export const useInvitations = (userType: 'professional' | 'artist') => {
  const { data: invitations, isLoading } = useQuery({
    queryKey: ['invitations', userType],
    queryFn: async () => {
      let query = supabase.from('casting_invitations').select(`
        *,
        castings (
          title,
          production_type,
          location,
          audition_date
        ),
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
        // Pour les professionnels : invitations envoyées
        const { data: profile } = await supabase
          .from('professional_profiles')
          .select('id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .single();

        if (profile) {
          query = query.eq('professional_profile_id', profile.id);
        }
      } else {
        // Pour les artistes : invitations reçues
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
        console.error('Error fetching invitations:', error);
        throw error;
      }

      return data || [];
    },
  });

  return {
    invitations: invitations || [],
    isLoading,
  };
};

export const useSendInvitation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (invitationData: Omit<CastingInvitationInsert, 'professional_profile_id'>) => {
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
        .from('casting_invitations')
        .insert({
          ...invitationData,
          professional_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending invitation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({
        title: "Invitation envoyée",
        description: "L'artiste a été invité à postuler pour ce casting.",
      });
    },
    onError: (error) => {
      console.error('Send invitation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation. L'artiste a peut-être déjà été invité.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInvitationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: any = { status };
      
      if (status === 'viewed') {
        updateData.viewed_at = new Date().toISOString();
      } else if (status === 'accepted' || status === 'declined') {
        updateData.responded_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('casting_invitations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating invitation:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      if (data.status === 'accepted') {
        toast({
          title: "Invitation acceptée",
          description: "Vous pouvez maintenant postuler à ce casting.",
        });
      } else if (data.status === 'declined') {
        toast({
          title: "Invitation déclinée",
          description: "L'invitation a été déclinée.",
        });
      }
    },
    onError: (error) => {
      console.error('Update invitation error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'invitation.",
        variant: "destructive",
      });
    },
  });
};
