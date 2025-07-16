
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface RealtimeNotification {
  id: string;
  type: 'message' | 'application' | 'invitation' | 'event';
  title: string;
  content: string;
  data?: any;
  created_at: string;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to new mail messages
    const messagesChannel = supabase
      .channel('new-mail-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mail_messages',
          filter: `recipient_id.eq.${user.id}`
        },
        (payload) => {
          const notification: RealtimeNotification = {
            id: payload.new.id,
            type: 'message',
            title: 'Nouveau message',
            content: `${payload.new.subject}: ${payload.new.content.substring(0, 100)}${payload.new.content.length > 100 ? '...' : ''}`,
            data: { messageId: payload.new.id },
            created_at: payload.new.created_at
          };

          setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 most recent
          
          toast({
            title: notification.title,
            description: `Nouveau message: ${payload.new.subject}`,
          });
        }
      )
      .subscribe();

    // Subscribe to new notifications
    const notificationsChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id.eq.${user.id}`
        },
        (payload) => {
          const notification: RealtimeNotification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            content: payload.new.content,
            data: payload.new.data,
            created_at: payload.new.created_at
          };

          setNotifications(prev => [notification, ...prev.slice(0, 9)]);
          
          toast({
            title: notification.title,
            description: notification.content,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [user, toast]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    clearNotifications,
    removeNotification
  };
};
