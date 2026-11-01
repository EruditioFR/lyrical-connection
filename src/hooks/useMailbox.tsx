import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { isMissingColumn, isMissingFunction } from '@/lib/supabaseErrors';
import { sortIntoFolders, isStarredBy, type RawMailMessage } from '@/utils/mailFolders';

interface Party {
  stage_name?: string;
  company_name?: string;
  profile_image_url?: string | null;
  logo_url?: string | null;
}

export interface MailMessage extends RawMailMessage {
  subject: string;
  content: string;
  is_read: boolean;
  /** Favori de l'utilisateur connecté (chaque participant a le sien) */
  is_starred: boolean;
  reply_to_id?: string;
  attachment_urls?: string[];
  created_at: string;
  read_at?: string;
  updated_at: string;
  sender?: Party | null;
  recipient?: Party | null;
}

export interface MailDraft {
  id: string;
  user_id: string;
  recipient_id?: string;
  subject?: string;
  content?: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  recipient?: Party | null;
}

type Raw = Omit<MailMessage, 'sender' | 'recipient' | 'is_starred'> & { is_starred?: boolean };

/** Noms et avatars de tous les correspondants, en deux requêtes au lieu de deux par message */
const fetchParties = async (userIds: string[]): Promise<Map<string, Party>> => {
  const map = new Map<string, Party>();
  if (userIds.length === 0) return map;
  const [artists, pros] = await Promise.all([
    supabase.from('artist_profiles').select('user_id, stage_name, profile_image_url').in('user_id', userIds),
    supabase.from('professional_profiles').select('user_id, company_name, logo_url').in('user_id', userIds),
  ]);
  (pros.data || []).forEach(p => p.user_id && map.set(p.user_id, { company_name: p.company_name, logo_url: p.logo_url }));
  (artists.data || []).forEach(a => a.user_id && map.set(a.user_id, { stage_name: a.stage_name, profile_image_url: a.profile_image_url }));
  return map;
};

const MAILBOX_LIMIT = 1000;

export const useMailbox = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  const notifyError = (title: string) => (error: Error) =>
    toast({ title, description: error.message, variant: 'destructive' });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['mailbox'] });

  // Une seule requête pour tous les dossiers ; les règles d'accès ne renvoient que la copie de l'utilisateur
  const { data, isLoading } = useQuery({
    queryKey: ['mailbox', 'all', userId],
    enabled: !!userId,
    queryFn: async () => {
      const [messages, drafts] = await Promise.all([
        supabase
          .from('mail_messages')
          .select('*')
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(MAILBOX_LIMIT),
        supabase.from('mail_drafts').select('*').eq('user_id', userId as string).order('updated_at', { ascending: false }),
      ]);
      if (messages.error) throw messages.error;
      if (drafts.error) throw drafts.error;

      const raw = (messages.data || []) as Raw[];
      const others = new Set<string>();
      raw.forEach(m => { others.add(m.sender_id); others.add(m.recipient_id); });
      (drafts.data || []).forEach(d => d.recipient_id && others.add(d.recipient_id));
      others.delete(userId as string);
      const parties = await fetchParties([...others]);

      const withParties: MailMessage[] = raw.map(m => ({
        ...m,
        is_starred: isStarredBy(m, userId as string),
        sender: parties.get(m.sender_id) ?? null,
        recipient: parties.get(m.recipient_id) ?? null,
      }));
      const draftsWithRecipient: MailDraft[] = (drafts.data || []).map(d => ({
        ...d,
        recipient: d.recipient_id ? parties.get(d.recipient_id) ?? null : null,
      })) as MailDraft[];
      return { messages: withParties, drafts: draftsWithRecipient };
    },
  });

  const folders = useMemo(
    () => sortIntoFolders(data?.messages || [], userId || ''),
    [data?.messages, userId]
  );
  const findMessage = (id: string) => data?.messages.find(m => m.id === id);
  const sideOf = (m: MailMessage) => ({ isSender: m.sender_id === userId, isRecipient: m.recipient_id === userId });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: {
      recipient_id: string;
      subject: string;
      content: string;
      reply_to_id?: string;
      attachment_urls?: string[];
    }) => {
      if (!userId) throw new Error('Utilisateur non connecté');
      const { data, error } = await supabase
        .from('mail_messages')
        .insert({ sender_id: userId, ...message })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Message envoyé', description: 'Votre message a été envoyé avec succès.' });
    },
    onError: notifyError("Le message n'a pas pu être envoyé"),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const m = findMessage(messageId);
      // Seul le destinataire marque un message comme lu
      if (!m || m.recipient_id !== userId || m.is_read) return;
      const { error } = await supabase
        .from('mail_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: notifyError('Erreur'),
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) => {
      const m = findMessage(messageId);
      if (!m) return;
      const { isSender, isRecipient } = sideOf(m);
      const update = {
        ...(isSender ? { is_starred_by_sender: !isStarred } : {}),
        ...(isRecipient ? { is_starred_by_recipient: !isStarred } : {}),
      };
      let { error } = await supabase.from('mail_messages').update(update).eq('id', messageId);
      if (isMissingColumn(error)) {
        // Base pas encore migrée : ancien favori commun
        ({ error } = await supabase.from('mail_messages').update({ is_starred: !isStarred }).eq('id', messageId));
      }
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: notifyError('Erreur'),
  });

  // Mettre à la corbeille (chacun a la sienne)
  const deleteMessageMutation = useMutation({
    mutationFn: async ({ messageId }: { messageId: string; isSender?: boolean }) => {
      const m = findMessage(messageId);
      if (!m) return;
      const { isSender, isRecipient } = sideOf(m);
      const { error } = await supabase
        .from('mail_messages')
        .update({
          ...(isSender ? { is_deleted_by_sender: true } : {}),
          ...(isRecipient ? { is_deleted_by_recipient: true } : {}),
        })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Message déplacé dans la corbeille' });
    },
    onError: notifyError('Impossible de supprimer le message'),
  });

  const restoreMessageMutation = useMutation({
    mutationFn: async ({ messageId }: { messageId: string; isSender?: boolean }) => {
      const m = findMessage(messageId);
      if (!m) return;
      const { isSender, isRecipient } = sideOf(m);
      const { error } = await supabase
        .from('mail_messages')
        .update({
          ...(isSender ? { is_deleted_by_sender: false } : {}),
          ...(isRecipient ? { is_deleted_by_recipient: false } : {}),
        })
        .eq('id', messageId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Message restauré' });
    },
    onError: notifyError('Impossible de restaurer le message'),
  });

  // Suppression définitive de SA copie : le message reste chez l'autre participant
  const purge = async (messages: MailMessage[]) => {
    if (messages.length === 0) return;
    const ids = messages.map(m => m.id);
    let { error } = await supabase.rpc('purge_mail_messages', { p_ids: ids });
    if (isMissingFunction(error)) {
      // Base pas encore migrée : ancien comportement (suppression de la ligne)
      ({ error } = await supabase.from('mail_messages').delete().in('id', ids));
    }
    if (error) throw error;
  };

  const permanentDeleteMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const m = findMessage(messageId);
      if (m) await purge([m]);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Message supprimé définitivement' });
    },
    onError: notifyError('Impossible de supprimer le message'),
  });

  const emptyTrashMutation = useMutation({
    mutationFn: async () => purge(folders.trash),
    onSuccess: () => {
      invalidate();
      toast({ title: 'Corbeille vidée' });
    },
    onError: notifyError('Impossible de vider la corbeille'),
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (draft: {
      id?: string;
      recipient_id?: string;
      subject?: string;
      content?: string;
      attachment_urls?: string[];
    }) => {
      if (!userId) throw new Error('Utilisateur non connecté');
      const { id, ...fields } = draft;
      const row = {
        recipient_id: fields.recipient_id ?? null,
        subject: fields.subject ?? null,
        content: fields.content ?? null,
        attachment_urls: fields.attachment_urls ?? null,
      };
      const { data, error } = id
        ? await supabase.from('mail_drafts').update(row).eq('id', id).select().single()
        : await supabase.from('mail_drafts').insert({ user_id: userId, ...row }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: invalidate,
  });

  const deleteDraftMutation = useMutation({
    mutationFn: async (draftId: string) => {
      const { error } = await supabase.from('mail_drafts').delete().eq('id', draftId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Nouveaux messages reçus en temps réel
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`mail_messages_changes_${userId}_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mail_messages', filter: `recipient_id=eq.${userId}` }, invalidate)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    inboxMessages: folders.inbox,
    sentMessages: folders.sent,
    starredMessages: folders.starred,
    drafts: data?.drafts || [],
    trashMessages: folders.trash,
    unreadCount: folders.inbox.filter(m => !m.is_read).length,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    sendMessageAsync: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    toggleStar: toggleStarMutation.mutate,
    deleteMessage: deleteMessageMutation.mutate,
    restoreMessage: restoreMessageMutation.mutate,
    permanentDelete: permanentDeleteMutation.mutate,
    emptyTrash: emptyTrashMutation.mutate,
    saveDraft: saveDraftMutation.mutate,
    saveDraftAsync: saveDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutate,
    deleteDraftAsync: deleteDraftMutation.mutateAsync,
  };
};

/** Compteur de messages non lus pour l'icône du menu : une seule requête de comptage */
export const useUnreadCount = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data = 0 } = useQuery({
    queryKey: ['mailbox', 'unread-count', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('mail_messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId as string)
        .eq('is_read', false)
        .eq('is_deleted_by_recipient', false);
      if (error) throw error;
      return count || 0;
    },
  });

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`mail_unread_${userId}_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mail_messages', filter: `recipient_id=eq.${userId}` },
        () => queryClient.invalidateQueries({ queryKey: ['mailbox'] }))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, queryClient]);

  return data;
};
