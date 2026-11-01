
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
        return <MessageSquare className="h-5 w-5 text-info" />;
      case 'casting_application':
        return <Megaphone className="h-5 w-5 text-gold-500" />;
      case 'event_registration':
        return <Calendar className="h-5 w-5 text-success" />;
      case 'profile_view':
        return <Eye className="h-5 w-5 text-warning" />;
      case 'casting_update':
        return <RotateCcw className="h-5 w-5 text-warning" />;
      case 'event_update':
        return <RotateCcw className="h-5 w-5 text-success" />;
      case 'invitation':
        return <Mail className="h-5 w-5 text-gold-500" />;
      case 'system':
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
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
            <div className="h-8 bg-muted rounded w-1/4"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
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

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-serif">Notifications</h1>
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
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="border-y border-border py-10">
            <h2 className="text-xl font-serif mb-2">Aucune notification</h2>
            <p className="text-muted-foreground">Vous n'avez pas encore reçu de notification.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex items-start gap-4 py-5">
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? '' : 'bg-gold-600'}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <h2 className={`text-lg font-serif ${notification.is_read ? 'font-normal' : ''}`}>
                    {!notification.is_read && <span className="sr-only">Non lue : </span>}
                    {notification.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {getNotificationTypeLabel(notification.type)} · {formatNotificationTime(notification.created_at)}
                  </p>
                  {notification.content && (
                    <p className="mt-2 leading-relaxed whitespace-pre-wrap">{notification.content}</p>
                  )}
                </div>
                {!notification.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="shrink-0">
                    Marquer comme lue
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
