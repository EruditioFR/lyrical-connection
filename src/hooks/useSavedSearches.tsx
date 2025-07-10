
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type SavedSearch = Tables<'saved_searches'>;
type SavedSearchInsert = TablesInsert<'saved_searches'>;
type SavedSearchUpdate = TablesUpdate<'saved_searches'>;

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
        .from('saved_searches')
        .insert({
          ...searchData,
          professional_profile_id: profile.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving search:', error);
        throw error;
      }

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
      console.error('Save search error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la recherche.",
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
