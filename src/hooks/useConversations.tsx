
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  title: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  is_archived: boolean | null;
  created_by: string | null;
  participants: ConversationParticipant[];
  last_message?: Message;
}

export interface ConversationParticipant {
  id: string;
  user_id: string;
  role: string | null;
  joined_at: string;
  left_at: string | null;
  last_read_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  reply_to_id: string | null;
  is_edited: boolean | null;
  is_deleted: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants:conversation_participants(*),
          messages:messages(*)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw error;
      }

      return data.map(conv => ({
        ...conv,
        last_message: conv.messages?.[conv.messages.length - 1]
      })) as Conversation[];
    },
    enabled: !!user
  });

  const createConversation = useMutation({
    mutationFn: async ({ 
      participantIds, 
      title, 
      type = 'direct' 
    }: { 
      participantIds: string[]; 
      title?: string; 
      type?: string; 
    }) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating conversation with participants:', participantIds);

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          title,
          type,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Conversation created:', conversation);

      // Add participants including current user
      const allParticipantIds = [user.id, ...participantIds.filter(id => id !== user.id)];
      const participants = allParticipantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      console.log('Adding participants:', participants);

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) {
        console.error('Error adding participants:', participantsError);
        throw participantsError;
      }

      return conversation;
    },
    onSuccess: (conversation) => {
      console.log('Conversation created successfully:', conversation);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation créée",
        description: "La conversation a été créée avec succès",
      });
    },
    onError: (error) => {
      console.error('Error in createConversation mutation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive",
      });
    }
  });

  // Real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return {
    conversations,
    isLoading,
    error,
    createConversation: createConversation.mutate,
    isCreating: createConversation.isPending
  };
};

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: messages = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId && !!user
  });

  const sendMessage = useMutation({
    mutationFn: async ({ 
      content, 
      messageType = 'text',
      replyToId 
    }: { 
      content: string; 
      messageType?: string;
      replyToId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          reply_to_id: replyToId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    }
  });

  const markAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    }
  });

  return {
    messages,
    isLoading,
    error,
    sendMessage: sendMessage.mutate,
    isSending: sendMessage.isPending,
    markAsRead: markAsRead.mutate
  };
};
