
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Check, CheckCheck, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import NotificationPreferencesDialog from './NotificationPreferencesDialog';

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showPreferences, setShowPreferences] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'casting_application':
        return '🎭';
      case 'event_registration':
        return '📅';
      case 'profile_view':
        return '👁️';
      case 'casting_update':
        return '📢';
      case 'event_update':
        return '🔄';
      case 'invitation':
        return '✉️';
      case 'system':
      default:
        return '🔔';
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: fr
    });
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-muted/50'
      }`}
      onClick={() => !notification.is_read && markAsRead(notification.id)}
    >
      <div className="flex gap-3">
        <div className="text-lg">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm ${
              !notification.is_read ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </h4>
            
            {!notification.is_read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
            )}
          </div>
          
          {notification.content && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {notification.content}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-2">
            {formatNotificationTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Notifications</h3>
              <div className="flex gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsRead()}
                    className="text-xs px-2 py-1 h-auto"
                  >
                    <CheckCheck className="w-3 h-3 mr-1" />
                    Tout lu
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(true)}
                  className="px-2 py-1 h-auto"
                >
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''} notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <ScrollArea className="max-h-96">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 5).map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                  />
                ))}
              </div>
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="justify-center cursor-pointer"
                onClick={() => navigate('/notifications')}
              >
                Voir toutes les notifications
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationPreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
      />
    </>
  );
};

export default NotificationCenter;
