import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardNotification } from '@/hooks/useDashboardData';
import { Panel, PanelList, PanelEmpty, PanelSkeleton, UnreadDot } from '@/components/dashboard/Panel';

interface RecentNotificationsProps {
  notifications: DashboardNotification[];
  isLoading: boolean;
}

const routes: Record<string, string> = {
  message: '/messages',
  application: '/mes-candidatures',
  event: '/evenements',
  invitation: '/notifications',
};

const RecentNotifications: React.FC<RecentNotificationsProps> = ({ notifications, isLoading }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la notification comme lue.',
        variant: 'destructive',
      });
    },
  });

  return (
    <Panel title="Notifications" action={{ to: '/notifications', label: 'Toutes les notifications' }}>
      {isLoading ? (
        <PanelSkeleton />
      ) : notifications.length === 0 ? (
        <PanelEmpty>Aucune notification pour le moment.</PanelEmpty>
      ) : (
        <PanelList>
          {notifications.map((notification) => (
            <li key={notification.id} className="flex items-start gap-3 py-3">
              {notification.is_read ? <span className="w-2 shrink-0" aria-hidden="true" /> : <UnreadDot />}
              <Link
                to={routes[notification.type] || '/notifications'}
                onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                className="flex-1 min-w-0 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className={`text-sm ${notification.is_read ? '' : 'font-semibold'}`}>{notification.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{notification.content}</p>
                <time dateTime={notification.created_at} className="text-xs text-muted-foreground">
                  {formatDistance(new Date(notification.created_at), new Date(), { addSuffix: true, locale: fr })}
                </time>
              </Link>
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  aria-label={`Marquer « ${notification.title} » comme lue`}
                  onClick={() => markAsRead.mutate(notification.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </li>
          ))}
        </PanelList>
      )}
    </Panel>
  );
};

export default RecentNotifications;
