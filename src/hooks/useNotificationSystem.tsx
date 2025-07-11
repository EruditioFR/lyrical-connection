
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les notifications non lues pour les admins
  const { data: adminNotifications, isLoading: isLoadingNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Créer une notification
  const createNotification = useMutation({
    mutationFn: async ({ 
      userId, 
      type, 
      title, 
      content, 
      data 
    }: {
      userId: string;
      type: 'upgrade_request' | 'account_expiry' | 'inactive_account' | 'payment_completed';
      title: string;
      content: string;
      data?: any;
    }) => {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          content,
          data: data || {}
        })
        .select()
        .single();

      if (error) throw error;
      return notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la notification.",
        variant: "destructive",
      });
    },
  });

  // Marquer une notification comme lue
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  // Vérifier les comptes inactifs
  const checkInactiveAccounts = useMutation({
    mutationFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Récupérer les comptes gratuits inactifs
      const { data: inactiveArtists, error: artistError } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('is_free_account', true)
        .lt('updated_at', thirtyDaysAgo.toISOString());

      const { data: inactiveProfessionals, error: professionalError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('is_free_account', true)
        .lt('updated_at', thirtyDaysAgo.toISOString());

      if (artistError || professionalError) {
        throw artistError || professionalError;
      }

      // Créer des notifications pour les comptes inactifs
      const allInactiveAccounts = [
        ...(inactiveArtists || []).map(a => ({ ...a, type: 'artist' })),
        ...(inactiveProfessionals || []).map(p => ({ ...p, type: 'professional' }))
      ];

      return allInactiveAccounts;
    },
    onSuccess: (inactiveAccounts) => {
      if (inactiveAccounts.length > 0) {
        toast({
          title: "Comptes inactifs détectés",
          description: `${inactiveAccounts.length} comptes gratuits sont inactifs depuis plus de 30 jours.`,
        });
      }
    },
  });

  return {
    adminNotifications,
    isLoadingNotifications,
    createNotification: createNotification.mutate,
    markAsRead: markAsRead.mutate,
    checkInactiveAccounts: checkInactiveAccounts.mutate,
    isCreatingNotification: createNotification.isPending,
    isMarkingAsRead: markAsRead.isPending,
    isCheckingInactiveAccounts: checkInactiveAccounts.isPending,
  };
};
