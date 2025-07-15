
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
      let applications: any[] = [];
      let entityName = '';
      let entityType = '';

      if (castingId) {
        // Récupérer le nom du casting
        const { data: casting, error: castingInfoError } = await supabase
          .from('castings')
          .select('title')
          .eq('id', castingId)
          .single();

        if (castingInfoError) throw castingInfoError;
        
        // Récupérer les candidatures du casting
        const { data: castingData, error: castingError } = await supabase
          .from('applications')
          .select(`
            *,
            artist_profiles(user_id)
          `)
          .eq('casting_id', castingId);

        if (castingError) throw castingError;
        
        applications = castingData || [];
        entityName = casting?.title || 'Casting';
        entityType = 'casting';
      } else if (eventId) {
        // Récupérer le nom de l'événement
        const { data: event, error: eventInfoError } = await supabase
          .from('professional_events')
          .select('title')
          .eq('id', eventId)
          .single();

        if (eventInfoError) throw eventInfoError;
        
        // Récupérer les inscriptions à l'événement
        const { data: eventData, error: eventError } = await supabase
          .from('event_applications')
          .select(`
            *,
            artist_profiles(user_id)
          `)
          .eq('event_id', eventId);

        if (eventError) throw eventError;
        
        applications = eventData || [];
        entityName = event?.title || 'Événement';
        entityType = 'event';
      }

      // Créer une notification pour chaque candidat
      const notifications = applications.map(app => {
        const statusText = getStatusText(app.status);
        const now = new Date();
        
        return {
          user_id: app.artist_profiles.user_id,
          type: (entityType === 'casting' ? 'casting_application' : 'event_registration') as 'casting_application' | 'event_registration',
          title: `Résultats publiés pour ${entityName}`,
          content: `[${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}] Vous avez été ${statusText} pour ${entityName}.`,
          data: {
            status: app.status,
            [entityType === 'casting' ? 'casting_id' : 'event_id']: entityType === 'casting' ? castingId : eventId,
            entity_name: entityName,
            entity_type: entityType
          },
          is_read: false,
          created_at: now.toISOString()
        };
      });

      // Insérer toutes les notifications en une fois
      if (notifications.length > 0) {
        const { data, error } = await supabase
          .from('notifications')
          .insert(notifications)
          .select();

        if (error) {
          console.error('Error creating notifications:', error);
          throw error;
        }

        return data;
      }

      return [];
    },
    onSuccess: (data) => {
      if (data && data.length > 0) {
        toast({
          title: "Notifications envoyées",
          description: `${data.length} notification(s) envoyée(s) aux candidats.`,
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
