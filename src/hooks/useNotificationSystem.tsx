
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
      type: 'message' | 'casting_application' | 'event_registration' | 'profile_view' | 'casting_update' | 'event_update' | 'system' | 'invitation';
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

      // Créer des notifications système pour les comptes inactifs
      const allInactiveAccounts = [
        ...(inactiveArtists || []).map(a => ({ ...a, type: 'artist' })),
        ...(inactiveProfessionals || []).map(p => ({ ...p, type: 'professional' }))
      ];

      // Créer une notification système pour l'admin
      if (allInactiveAccounts.length > 0 && user?.id) {
        await createNotification.mutateAsync({
          userId: user.id,
          type: 'system',
          title: 'Comptes inactifs détectés',
          content: `${allInactiveAccounts.length} comptes gratuits sont inactifs depuis plus de 30 jours.`,
          data: { inactiveAccounts: allInactiveAccounts }
        });
      }

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

  // Hook pour créer des notifications en masse lors de la publication des résultats
  const createResultsNotifications = useMutation({
    mutationFn: async ({ castingId, eventId }: { castingId?: string; eventId?: string }) => {
      if (castingId) {
        // Utiliser la fonction de base de données pour les castings
        const { error } = await supabase.rpc('create_results_notifications', {
          p_entity_id: castingId,
          p_entity_type: 'casting'
        });

        if (error) {
          console.error('Error creating casting notifications:', error);
          throw error;
        }

        // Récupérer le nombre de candidatures pour le message de succès
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('casting_id', castingId);

        return { count: count || 0 };
      } else if (eventId) {
        // Utiliser la fonction de base de données pour les événements
        const { error } = await supabase.rpc('create_results_notifications', {
          p_entity_id: eventId,
          p_entity_type: 'event'
        });

        if (error) {
          console.error('Error creating event notifications:', error);
          throw error;
        }

        // Récupérer le nombre d'inscriptions pour le message de succès
        const { count } = await supabase
          .from('event_applications')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId);

        return { count: count || 0 };
      }

      return { count: 0 };
    },
    onSuccess: (data) => {
      if (data && data.count > 0) {
        toast({
          title: "Notifications envoyées",
          description: `${data.count} notification(s) envoyée(s) aux candidats.`,
        });
      }
    },
    onError: (error) => {
      console.error('Create results notifications error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer les notifications.",
        variant: "destructive",
      });
    },
  });

  return {
    adminNotifications,
    isLoadingNotifications,
    createNotification: createNotification.mutate,
    markAsRead: markAsRead.mutate,
    checkInactiveAccounts: checkInactiveAccounts.mutate,
    createResultsNotifications: createResultsNotifications.mutate,
    isCreatingNotification: createNotification.isPending,
    isMarkingAsRead: markAsRead.isPending,
    isCheckingInactiveAccounts: checkInactiveAccounts.isPending,
    isCreatingResultsNotifications: createResultsNotifications.isPending,
  };
};

// Fonction utilitaire pour obtenir le texte du statut
const getStatusText = (status: string): string => {
  switch (status) {
    case 'accepted':
      return 'accepté(e)';
    case 'rejected':
      return 'refusé(e)';
    case 'waitlisted':
      return 'mis(e) en liste d\'attente';
    case 'shortlisted':
      return 'présélectionné(e)';
    case 'pending':
    default:
      return 'en attente';
  }
};
