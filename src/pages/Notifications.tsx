
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellRing, 
  ArrowLeft,
  MessageSquare,
  Calendar,
  Eye,
  Megaphone,
  RotateCcw,
  Mail,
  Settings,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Notification } from '@/hooks/useNotifications';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'casting_application':
        return <Megaphone className="h-5 w-5 text-purple-500" />;
      case 'event_registration':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'profile_view':
        return <Eye className="h-5 w-5 text-orange-500" />;
      case 'casting_update':
        return <RotateCcw className="h-5 w-5 text-yellow-500" />;
      case 'event_update':
        return <RotateCcw className="h-5 w-5 text-teal-500" />;
      case 'invitation':
        return <Mail className="h-5 w-5 text-pink-500" />;
      case 'system':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'Message';
      case 'casting_application':
        return 'Candidature';
      case 'event_registration':
        return 'Événement';
      case 'profile_view':
        return 'Profil';
      case 'casting_update':
        return 'Casting';
      case 'event_update':
        return 'Événement';
      case 'invitation':
        return 'Invitation';
      case 'system':
      default:
        return 'Système';
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {unreadCount > 0 ? (
                <BellRing className="h-8 w-8 text-blue-500" />
              ) : (
                <Bell className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-muted-foreground">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                  {unreadCount > 0 && (
                    <span className="ml-2">
                      • {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={() => markAllAsRead()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                Vous n'avez pas encore reçu de notifications.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <Card 
                key={notification.id}
                className={`transition-all duration-200 ${
                  !notification.is_read 
                    ? 'border-blue-200 bg-blue-50/50 shadow-md' 
                    : 'hover:shadow-sm'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className={`text-lg ${
                            !notification.is_read ? 'font-semibold' : 'font-medium'
                          }`}>
                            {notification.title}
                          </CardTitle>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          <span>•</span>
                          <span>{formatNotificationTime(notification.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Marquer comme lu
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {notification.content && (
                  <CardContent className="pt-0">
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-blue-500">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {notification.content}
                      </p>
                    </div>
                  </CardContent>
                )}

                {index < notifications.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
