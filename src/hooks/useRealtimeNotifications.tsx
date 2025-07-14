
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

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id.neq.${user.id}` // Don't notify for own messages
        },
        async (payload) => {
          // Check if user is participant in the conversation
          const { data: participant } = await supabase
            .from('conversation_participants')
            .select('*')
            .eq('conversation_id', payload.new.conversation_id)
            .eq('user_id', user.id)
            .single();

          if (participant) {
            const notification: RealtimeNotification = {
              id: payload.new.id,
              type: 'message',
              title: 'Nouveau message',
              content: payload.new.content.substring(0, 100) + (payload.new.content.length > 100 ? '...' : ''),
              data: { conversationId: payload.new.conversation_id },
              created_at: payload.new.created_at
            };

            setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 most recent
            
            toast({
              title: notification.title,
              description: notification.content,
            });
          }
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
