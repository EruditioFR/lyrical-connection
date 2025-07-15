
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'waitlisted':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'shortlisted':
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-800';
      case 'rejected':
        return 'text-red-800';
      case 'waitlisted':
        return 'text-yellow-800';
      case 'shortlisted':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const handleNotificationClick = (notification: any, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    
    // Force navigation to notifications page
    navigate('/notifications');
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Megaphone className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Megaphone className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 max-h-96" align="end" forceMount>
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsRead()}
              className="text-xs"
            >
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Megaphone className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune notification</p>
          </div>
        ) : (
          <ScrollArea className="max-h-80">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.is_read ? 'bg-blue-50' : ''}`}
                onClick={(event) => handleNotificationClick(notification, event)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">
                    {notification.data?.status && getStatusIcon(notification.data.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2 mt-1" />
                      )}
                    </div>
                    
                    {notification.content && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                    )}
                    
                    {notification.data?.status && (
                      <div className="flex items-center mt-2">
                        <span className={`text-xs font-medium ${getStatusColor(notification.data.status)}`}>
                          Statut: {notification.data.status === 'accepted' ? 'Accepté' : 
                                  notification.data.status === 'rejected' ? 'Refusé' :
                                  notification.data.status === 'waitlisted' ? 'Liste d\'attente' :
                                  notification.data.status === 'shortlisted' ? 'Présélectionné' : 'En attente'}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
