
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  Clock, 
  CreditCard, 
  UserX,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationCenter = () => {
  const { 
    adminNotifications, 
    isLoadingNotifications, 
    markAsRead, 
    checkInactiveAccounts,
    isCheckingInactiveAccounts 
  } = useNotificationSystem();

  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'upgrade_request':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'account_expiry':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'inactive_account':
        return <UserX className="h-4 w-4 text-red-500" />;
      case 'payment_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'upgrade_request':
        return 'default';
      case 'account_expiry':
        return 'destructive';
      case 'inactive_account':
        return 'outline';
      case 'payment_completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredNotifications = adminNotifications?.filter(notification => {
    if (filter === 'unread') return !notification.is_read;
    return true;
  }) || [];

  const unreadCount = adminNotifications?.filter(n => !n.is_read).length || 0;

  useEffect(() => {
    // Vérifier les comptes inactifs au chargement
    checkInactiveAccounts();
  }, []);

  if (isLoadingNotifications) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <BellRing className="h-5 w-5 text-blue-500" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            onClick={() => checkInactiveAccounts()}
            disabled={isCheckingInactiveAccounts}
            variant="outline"
            size="sm"
          >
            {isCheckingInactiveAccounts ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Vérification...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Vérifier les comptes
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="all">
              Toutes ({adminNotifications?.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={filter} className="mt-4">
            <ScrollArea className="h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune notification {filter === 'unread' ? 'non lue' : ''}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        !notification.is_read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      } hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <Badge variant={getNotificationVariant(notification.type)} className="text-xs">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </span>
                            {!notification.is_read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                variant="ghost"
                                size="sm"
                              >
                                Marquer comme lu
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
