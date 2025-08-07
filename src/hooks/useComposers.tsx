import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface Composer extends Tables<'composers'> {}

type ComposerInsert = TablesInsert<'composers'>;
type ComposerUpdate = TablesUpdate<'composers'>;

export const useComposers = (searchTerm?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: composers, isLoading, error } = useQuery({
    queryKey: ['composers', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('composers')
        .select('*')
        .order('name');

      if (searchTerm && searchTerm.length > 1) {
        query = query.or(`name.ilike.%${searchTerm}%,complete_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching composers:', error);
        throw error;
      }

      return data as Composer[];
    },
    enabled: !searchTerm || searchTerm.length > 1,
  });

  const createMutation = useMutation({
    mutationFn: async (composerData: ComposerInsert) => {
      const { data, error } = await supabase
        .from('composers')
        .insert(composerData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composers'] });
      toast({
        title: "Compositeur ajouté",
        description: "Le compositeur a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating composer:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le compositeur.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: ComposerUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('composers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composers'] });
      toast({
        title: "Compositeur mis à jour",
        description: "Les modifications ont été sauvegardées.",
      });
    },
    onError: (error) => {
      console.error('Error updating composer:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le compositeur.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('composers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['composers'] });
      toast({
        title: "Compositeur supprimé",
        description: "Le compositeur a été supprimé.",
      });
    },
    onError: (error) => {
      console.error('Error deleting composer:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compositeur.",
        variant: "destructive",
      });
    },
  });

  return {
    composers: composers || [],
    isLoading,
    error,
    createComposer: createMutation.mutate,
    updateComposer: updateMutation.mutate,
    deleteComposer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};