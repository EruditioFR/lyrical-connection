import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type ArtistList = Tables<'professional_artist_lists'> & {
  items: Pick<Tables<'professional_artist_list_items'>, 'id' | 'artist_profile_id' | 'role_name'>[];
};
export type ArtistNote = Tables<'professional_artist_notes'>;

// Tant que la migration n'est pas appliquée, PostgREST répond « table introuvable »
const isMissingTable = (error: { code?: string } | null) =>
  !!error && (error.code === 'PGRST205' || error.code === '42P01');

const notifyError = (error: Error) =>
  toast({ title: 'Erreur', description: error.message, variant: 'destructive' });

/** Listes de projet (shortlists) d'un professionnel */
export const useArtistLists = (professionalProfileId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['artist-lists', professionalProfileId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ lists: ArtistList[]; unavailable: boolean }> => {
      const { data, error } = await supabase
        .from('professional_artist_lists')
        .select('*, items:professional_artist_list_items(id, artist_profile_id, role_name)')
        .eq('professional_profile_id', professionalProfileId as string)
        .order('created_at', { ascending: false });

      if (isMissingTable(error)) return { lists: [], unavailable: true };
      if (error) throw error;
      return { lists: (data || []) as ArtistList[], unavailable: false };
    },
    enabled: !!professionalProfileId,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const createList = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('professional_artist_lists')
        .insert({ professional_profile_id: professionalProfileId as string, name, description: description || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Liste créée' });
    },
    onError: notifyError,
  });

  const deleteList = useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await supabase.from('professional_artist_lists').delete().eq('id', listId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast({ title: 'Liste supprimée' });
    },
    onError: notifyError,
  });

  const toggleArtist = useMutation({
    mutationFn: async ({ listId, artistProfileId }: { listId: string; artistProfileId: string }) => {
      const list = data?.lists.find(l => l.id === listId);
      const existing = list?.items.find(i => i.artist_profile_id === artistProfileId);
      if (existing) {
        const { error } = await supabase.from('professional_artist_list_items').delete().eq('id', existing.id);
        if (error) throw error;
        return 'removed' as const;
      }
      const { error } = await supabase
        .from('professional_artist_list_items')
        .insert({ list_id: listId, artist_profile_id: artistProfileId });
      if (error) throw error;
      return 'added' as const;
    },
    onSuccess: (action) => {
      invalidate();
      toast({ title: action === 'added' ? 'Artiste ajouté à la liste' : 'Artiste retiré de la liste' });
    },
    onError: notifyError,
  });

  const setRole = useMutation({
    mutationFn: async ({ itemId, roleName }: { itemId: string; roleName: string }) => {
      const { error } = await supabase
        .from('professional_artist_list_items')
        .update({ role_name: roleName || null })
        .eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: notifyError,
  });

  return {
    lists: data?.lists || [],
    unavailable: data?.unavailable || false,
    isLoading,
    createList,
    deleteList,
    toggleArtist,
    setRole,
  };
};

/** Notes privées et étiquettes d'un professionnel sur ses artistes */
export const useArtistNotes = (professionalProfileId?: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['artist-notes', professionalProfileId];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<{ notes: ArtistNote[]; unavailable: boolean }> => {
      const { data, error } = await supabase
        .from('professional_artist_notes')
        .select('*')
        .eq('professional_profile_id', professionalProfileId as string);

      if (isMissingTable(error)) return { notes: [], unavailable: true };
      if (error) throw error;
      return { notes: data || [], unavailable: false };
    },
    enabled: !!professionalProfileId,
  });

  const saveNote = useMutation({
    mutationFn: async ({ artistProfileId, note, tags }: { artistProfileId: string; note: string; tags: string[] }) => {
      const { error } = await supabase
        .from('professional_artist_notes')
        .upsert(
          { professional_profile_id: professionalProfileId as string, artist_profile_id: artistProfileId, note, tags },
          { onConflict: 'professional_profile_id,artist_profile_id' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Notes enregistrées' });
    },
    onError: notifyError,
  });

  const notes = data?.notes || [];
  return {
    notes,
    unavailable: data?.unavailable || false,
    isLoading,
    noteFor: (artistProfileId: string) => notes.find(n => n.artist_profile_id === artistProfileId),
    allTags: [...new Set(notes.flatMap(n => n.tags))].sort((a, b) => a.localeCompare(b, 'fr')),
    saveNote,
  };
};
