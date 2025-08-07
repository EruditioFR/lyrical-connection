import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export interface LyricalWorkWithRoles extends Tables<'lyrical_works'> {
  work_roles: Tables<'work_roles'>[];
}

export type LyricalWorkInsert = TablesInsert<'lyrical_works'>;
export type LyricalWorkUpdate = TablesUpdate<'lyrical_works'>;
export type WorkRoleInsert = TablesInsert<'work_roles'>;
export type WorkRoleUpdate = TablesUpdate<'work_roles'>;

export const useLyricalWorksAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all lyrical works with their roles
  const { data: works, isLoading, error } = useQuery({
    queryKey: ['admin-lyrical-works'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lyrical_works')
        .select(`
          *,
          work_roles (*)
        `)
        .order('title');

      if (error) {
        console.error('Error fetching lyrical works:', error);
        throw error;
      }

      return data as LyricalWorkWithRoles[];
    },
  });

  // Create lyrical work
  const createWork = useMutation({
    mutationFn: async (workData: LyricalWorkInsert) => {
      const { data, error } = await supabase
        .from('lyrical_works')
        .insert(workData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['lyrical-works'] });
      toast({
        title: "Œuvre créée",
        description: "L'œuvre lyrique a été créée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating lyrical work:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'œuvre lyrique.",
        variant: "destructive",
      });
    },
  });

  // Update lyrical work
  const updateWork = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: LyricalWorkUpdate }) => {
      const { data: updatedData, error } = await supabase
        .from('lyrical_works')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['lyrical-works'] });
      toast({
        title: "Œuvre modifiée",
        description: "L'œuvre lyrique a été modifiée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating lyrical work:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'œuvre lyrique.",
        variant: "destructive",
      });
    },
  });

  // Delete lyrical work
  const deleteWork = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lyrical_works')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['lyrical-works'] });
      toast({
        title: "Œuvre supprimée",
        description: "L'œuvre lyrique a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error deleting lyrical work:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'œuvre lyrique.",
        variant: "destructive",
      });
    },
  });

  // Create work role
  const createRole = useMutation({
    mutationFn: async (roleData: WorkRoleInsert) => {
      const { data, error } = await supabase
        .from('work_roles')
        .insert(roleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['work-roles'] });
      toast({
        title: "Rôle créé",
        description: "Le rôle a été créé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating work role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rôle.",
        variant: "destructive",
      });
    },
  });

  // Update work role
  const updateRole = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkRoleUpdate }) => {
      const { data: updatedData, error } = await supabase
        .from('work_roles')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['work-roles'] });
      toast({
        title: "Rôle modifié",
        description: "Le rôle a été modifié avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating work role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle.",
        variant: "destructive",
      });
    },
  });

  // Delete work role
  const deleteRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('work_roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lyrical-works'] });
      queryClient.invalidateQueries({ queryKey: ['work-roles'] });
      toast({
        title: "Rôle supprimé",
        description: "Le rôle a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error deleting work role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le rôle.",
        variant: "destructive",
      });
    },
  });

  return {
    works: works || [],
    isLoading,
    error,
    createWork: createWork.mutate,
    updateWork: updateWork.mutate,
    deleteWork: deleteWork.mutate,
    createRole: createRole.mutate,
    updateRole: updateRole.mutate,
    deleteRole: deleteRole.mutate,
    isCreatingWork: createWork.isPending,
    isUpdatingWork: updateWork.isPending,
    isDeletingWork: deleteWork.isPending,
    isCreatingRole: createRole.isPending,
    isUpdatingRole: updateRole.isPending,
    isDeletingRole: deleteRole.isPending,
  };
};