
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ProfessionalProfile = Tables<'professional_profiles'>;
type ProfessionalProfileInsert = TablesInsert<'professional_profiles'>;
type ProfessionalProfileUpdate = TablesUpdate<'professional_profiles'>;

export const useProfessionalProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['professional-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching professional profile:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (profileData: Omit<ProfessionalProfileInsert, 'user_id'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professional_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile', user?.id] });
      toast({
        title: "Profil créé",
        description: "Votre profil professionnel a été créé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le profil.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: ProfessionalProfileUpdate) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professional_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professional-profile', user?.id] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    isLoading,
    error,
    createProfile: createMutation.mutate,
    updateProfile: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
