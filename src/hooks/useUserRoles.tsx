
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useUserRoles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        console.log('useUserRoles: Pas d\'utilisateur connecté');
        return [];
      }
      
      console.log('useUserRoles: Récupération des rôles pour l\'utilisateur:', user.id);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('useUserRoles: Erreur lors de la récupération des rôles:', error);
        throw error;
      }

      console.log('useUserRoles: Rôles récupérés:', data);
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin') || false;

  console.log('useUserRoles: isAdmin =', isAdmin, 'pour utilisateur:', user?.email);

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['free-accounts'] });
      toast({
        title: "Rôle assigné",
        description: "Le rôle a été assigné avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error assigning role:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le rôle.",
        variant: "destructive",
      });
    },
  });

  // Fonction pour forcer le rafraîchissement des rôles
  const refreshRoles = () => {
    console.log('useUserRoles: Rafraîchissement forcé des rôles');
    queryClient.invalidateQueries({ queryKey: ['user-roles', user?.id] });
  };

  return {
    userRoles,
    isAdmin,
    isLoading,
    assignRole: assignRole.mutate,
    isAssigningRole: assignRole.isPending,
    refreshRoles,
  };
};
