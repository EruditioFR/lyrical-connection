import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MailMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  is_starred: boolean;
  is_deleted_by_sender: boolean;
  is_deleted_by_recipient: boolean;
  reply_to_id?: string;
  attachment_urls?: string[];
  created_at: string;
  read_at?: string;
  updated_at: string;
  sender?: {
    stage_name?: string;
    company_name?: string;
    profile_image_url?: string;
    logo_url?: string;
  };
  recipient?: {
    stage_name?: string;
    company_name?: string;
    profile_image_url?: string;
    logo_url?: string;
  };
}

interface MailDraft {
  id: string;
  user_id: string;
  recipient_id?: string;
  subject?: string;
  content?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
}

export const useMailbox = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inbox messages
  const { data: inboxMessages = [], isLoading: isLoadingInbox } = useQuery({
    queryKey: ['mailbox', 'inbox'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_messages')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('is_deleted_by_recipient', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils des expéditeurs
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const [artistProfile, professionalProfile] = await Promise.all([
            supabase
              .from('artist_profiles')
              .select('stage_name, profile_image_url, user_id')
              .eq('user_id', message.sender_id)
              .single(),
            supabase
              .from('professional_profiles')
              .select('company_name, logo_url, user_id')
              .eq('user_id', message.sender_id)
              .single()
          ]);

          const sender = artistProfile.data 
            ? { 
                stage_name: artistProfile.data.stage_name, 
                profile_image_url: artistProfile.data.profile_image_url 
              }
            : professionalProfile.data 
            ? { 
                company_name: professionalProfile.data.company_name, 
                logo_url: professionalProfile.data.logo_url 
              }
            : null;

          return { ...message, sender };
        })
      );

      return messagesWithProfiles as MailMessage[];
    },
  });

  // Fetch sent messages
  const { data: sentMessages = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ['mailbox', 'sent'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_messages')
        .select('*')
        .eq('sender_id', user.id)
        .eq('is_deleted_by_sender', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils des destinataires
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const [artistProfile, professionalProfile] = await Promise.all([
            supabase
              .from('artist_profiles')
              .select('stage_name, profile_image_url, user_id')
              .eq('user_id', message.recipient_id)
              .single(),
            supabase
              .from('professional_profiles')
              .select('company_name, logo_url, user_id')
              .eq('user_id', message.recipient_id)
              .single()
          ]);

          const recipient = artistProfile.data 
            ? { 
                stage_name: artistProfile.data.stage_name, 
                profile_image_url: artistProfile.data.profile_image_url 
              }
            : professionalProfile.data 
            ? { 
                company_name: professionalProfile.data.company_name, 
                logo_url: professionalProfile.data.logo_url 
              }
            : null;

          return { ...message, recipient };
        })
      );

      return messagesWithProfiles as MailMessage[];
    },
  });

  // Fetch starred messages
  const { data: starredMessages = [], isLoading: isLoadingStarred } = useQuery({
    queryKey: ['mailbox', 'starred'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_messages')
        .select('*')
        .eq('is_starred', true)
        .or(`and(recipient_id.eq.${user.id},is_deleted_by_recipient.eq.false),and(sender_id.eq.${user.id},is_deleted_by_sender.eq.false)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils pour les messages favoris
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const [senderArtist, senderPro, recipientArtist, recipientPro] = await Promise.all([
            supabase.from('artist_profiles').select('stage_name, profile_image_url').eq('user_id', message.sender_id).single(),
            supabase.from('professional_profiles').select('company_name, logo_url').eq('user_id', message.sender_id).single(),
            supabase.from('artist_profiles').select('stage_name, profile_image_url').eq('user_id', message.recipient_id).single(),
            supabase.from('professional_profiles').select('company_name, logo_url').eq('user_id', message.recipient_id).single()
          ]);

          const sender = senderArtist.data || senderPro.data;
          const recipient = recipientArtist.data || recipientPro.data;

          return { ...message, sender, recipient };
        })
      );

      return messagesWithProfiles as MailMessage[];
    },
  });

  // Fetch drafts
  const { data: drafts = [], isLoading: isLoadingDrafts } = useQuery({
    queryKey: ['mailbox', 'drafts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_drafts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as MailDraft[];
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: {
      recipient_id: string;
      subject: string;
      content: string;
      reply_to_id?: string;
      attachment_urls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_messages')
        .insert({
          sender_id: user.id,
          ...message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      console.log('Marquage comme lu du message:', messageId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      console.log('Utilisateur actuel:', user.id);

      const { error } = await supabase
        .from('mail_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur lors du marquage comme lu:', error);
        throw error;
      }
      console.log('Message marqué comme lu avec succès');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) => {
      console.log('Basculement étoile pour le message:', { messageId, isStarred });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      console.log('Utilisateur actuel:', user.id);

      const { error } = await supabase
        .from('mail_messages')
        .update({ is_starred: !isStarred })
        .eq('id', messageId);

      if (error) {
        console.error('Erreur lors du basculement étoile:', error);
        throw error;
      }
      console.log('Étoile basculée avec succès');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
    },
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async ({ messageId, isSender }: { messageId: string; isSender: boolean }) => {
      console.log('=== DÉBUT SUPPRESSION MESSAGE ===');
      console.log('ID du message:', messageId);
      console.log('Est expéditeur:', isSender);
      
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Utilisateur non authentifié');
        throw new Error('User not authenticated');
      }
      console.log('ID utilisateur actuel:', user.id);

      // Récupérer les détails du message pour vérification
      const { data: messageData, error: fetchError } = await supabase
        .from('mail_messages')
        .select('id, sender_id, recipient_id, subject, is_deleted_by_sender, is_deleted_by_recipient')
        .eq('id', messageId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération du message:', fetchError);
        throw fetchError;
      }

      console.log('Détails du message:', messageData);
      console.log('Utilisateur est expéditeur:', messageData.sender_id === user.id);
      console.log('Utilisateur est destinataire:', messageData.recipient_id === user.id);

      // Déterminer le champ à mettre à jour
      const updateField = isSender ? 'is_deleted_by_sender' : 'is_deleted_by_recipient';
      console.log('Champ à mettre à jour:', updateField);
      
      // Créer l'objet de mise à jour
      const updateData = { [updateField]: true };
      console.log('Données de mise à jour:', updateData);

      // Effectuer la mise à jour
      const { data: updateResult, error } = await supabase
        .from('mail_messages')
        .update(updateData)
        .eq('id', messageId)
        .select();

      if (error) {
        console.error('=== ERREUR LORS DE LA SUPPRESSION ===');
        console.error('Code d\'erreur:', error.code);
        console.error('Message d\'erreur:', error.message);
        console.error('Détails:', error.details);
        console.error('Hint:', error.hint);
        throw error;
      }
      
      console.log('=== SUPPRESSION RÉUSSIE ===');
      console.log('Résultat de la mise à jour:', updateResult);
      return updateResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé.",
      });
    },
    onError: (error) => {
      console.error('Erreur dans onError:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message.",
        variant: "destructive",
      });
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: async (draft: {
      id?: string;
      recipient_id?: string;
      subject?: string;
      content?: string;
      attachment_urls?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (draft.id) {
        const { data, error } = await supabase
          .from('mail_drafts')
          .update({
            recipient_id: draft.recipient_id,
            subject: draft.subject,
            content: draft.content,
            attachment_urls: draft.attachment_urls,
          })
          .eq('id', draft.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('mail_drafts')
          .insert({
            user_id: user.id,
            ...draft,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox', 'drafts'] });
    },
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const { error } = await supabase
        .from('mail_drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox', 'drafts'] });
    },
  });

  // Fetch trash messages
  const { data: trashMessages = [], isLoading: isLoadingTrash } = useQuery({
    queryKey: ['mailbox', 'trash'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('mail_messages')
        .select('*')
        .or(`and(recipient_id.eq.${user.id},is_deleted_by_recipient.eq.true),and(sender_id.eq.${user.id},is_deleted_by_sender.eq.true)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les profils pour les messages de la corbeille
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (message) => {
          const [senderArtist, senderPro, recipientArtist, recipientPro] = await Promise.all([
            supabase.from('artist_profiles').select('stage_name, profile_image_url').eq('user_id', message.sender_id).single(),
            supabase.from('professional_profiles').select('company_name, logo_url').eq('user_id', message.sender_id).single(),
            supabase.from('artist_profiles').select('stage_name, profile_image_url').eq('user_id', message.recipient_id).single(),
            supabase.from('professional_profiles').select('company_name, logo_url').eq('user_id', message.recipient_id).single()
          ]);

          const sender = senderArtist.data || senderPro.data;
          const recipient = recipientArtist.data || recipientPro.data;

          return { ...message, sender, recipient };
        })
      );

      return messagesWithProfiles as MailMessage[];
    },
  });

  // Restore message mutation
  const restoreMessageMutation = useMutation({
    mutationFn: async ({ messageId, isSender }: { messageId: string; isSender: boolean }) => {
      const updateField = isSender ? 'is_deleted_by_sender' : 'is_deleted_by_recipient';
      const { error } = await supabase
        .from('mail_messages')
        .update({ [updateField]: false })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      toast({
        title: "Message restauré",
        description: "Le message a été restauré.",
      });
    },
  });

  // Permanently delete message mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('mail_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailbox'] });
      toast({
        title: "Message supprimé définitivement",
        description: "Le message a été supprimé définitivement.",
      });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('mail_messages_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mail_messages',
            filter: `recipient_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['mailbox'] });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    getUser();
  }, [queryClient]);

  const unreadCount = inboxMessages.filter(msg => !msg.is_read).length;

  return {
    inboxMessages,
    sentMessages,
    starredMessages,
    drafts,
    trashMessages,
    unreadCount,
    isLoading: isLoadingInbox || isLoadingSent || isLoadingStarred || isLoadingDrafts || isLoadingTrash,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    toggleStar: toggleStarMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    restoreMessage: restoreMessageMutation.mutate,
    permanentDelete: permanentDeleteMutation.mutate,
    saveDraft: saveDraftMutation.mutate,
    deleteDraft: deleteDraftMutation.mutate,
  };
};
