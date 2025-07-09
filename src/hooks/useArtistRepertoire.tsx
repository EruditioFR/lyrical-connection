
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface ArtistRepertoireWithDetails extends Tables<'artist_repertoire'> {
  lyrical_works: Tables<'lyrical_works'>;
  work_roles?: Tables<'work_roles'> | null;
}

type ArtistRepertoireInsert = TablesInsert<'artist_repertoire'>;
type ArtistRepertoireUpdate = TablesUpdate<'artist_repertoire'>;

export const useArtistRepertoire = (artistProfileId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: repertoire, isLoading, error } = useQuery({
    queryKey: ['artist-repertoire', artistProfileId],
    queryFn: async () => {
      if (!artistProfileId) return [];

      const { data, error } = await supabase
        .from('artist_repertoire')
        .select(`
          *,
          lyrical_works (*),
          work_roles (*)
        `)
        .eq('artist_profile_id', artistProfileId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artist repertoire:', error);
        throw error;
      }

      return data as ArtistRepertoireWithDetails[];
    },
    enabled: !!artistProfileId,
  });

  const addMutation = useMutation({
    mutationFn: async (repertoireData: ArtistRepertoireInsert) => {
      const { data, error } = await supabase
        .from('artist_repertoire')
        .insert(repertoireData)
        .select(`
          *,
          lyrical_works (*),
          work_roles (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-repertoire', artistProfileId] });
      toast({
        title: "Œuvre ajoutée",
        description: "L'œuvre a été ajoutée à votre répertoire avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error adding to repertoire:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'œuvre au répertoire.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: ArtistRepertoireUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('artist_repertoire')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          lyrical_works (*),
          work_roles (*)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-repertoire', artistProfileId] });
      toast({
        title: "Répertoire mis à jour",
        description: "Les modifications ont été sauvegardées avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating repertoire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le répertoire.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('artist_repertoire')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-repertoire', artistProfileId] });
      toast({
        title: "Œuvre supprimée",
        description: "L'œuvre a été supprimée de votre répertoire.",
      });
    },
    onError: (error) => {
      console.error('Error deleting from repertoire:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'œuvre du répertoire.",
        variant: "destructive",
      });
    },
  });

  return {
    repertoire: repertoire || [],
    isLoading,
    error,
    addToRepertoire: addMutation.mutate,
    updateRepertoire: updateMutation.mutate,
    deleteFromRepertoire: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
