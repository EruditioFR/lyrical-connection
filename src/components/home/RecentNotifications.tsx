import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, ArrowRight, Check, Info, AlertCircle, Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DashboardNotification } from '@/hooks/useDashboardData';

interface RecentNotificationsProps {
  notifications: DashboardNotification[];
  isLoading: boolean;
}

const RecentNotifications: React.FC<RecentNotificationsProps> = ({ notifications, isLoading }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue.",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'application':
        return <Info className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'invitation':
        return <Bell className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleNotificationClick = (notification: DashboardNotification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    // Navigation basée sur le type de notification
    const routes: { [key: string]: string } = {
      message: '/messages',
      application: '/mes-candidatures',
      event: '/evenements',
      invitation: '/notifications',
    };
    
    const route = routes[notification.type] || '/notifications';
    window.location.href = route;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications récentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notifications récentes
          </CardTitle>
          <Link to="/notifications">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune notification récente
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  notification.is_read 
                    ? 'hover:bg-accent/50' 
                    : 'bg-accent/30 hover:bg-accent/50 border border-primary/20'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`p-2 rounded-full ${
                  notification.is_read ? 'bg-muted' : 'bg-primary text-primary-foreground'
                }`}>
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-medium line-clamp-2">
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <Badge variant="default" className="text-xs shrink-0">
                        Nouveau
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {notification.content}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(new Date(notification.created_at), new Date(), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                    
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Link to="/notifications" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Centre de notifications
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentNotifications;