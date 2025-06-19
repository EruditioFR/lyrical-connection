
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type ArtistAir = Tables<'artist_airs'>;
type ArtistAirInsert = TablesInsert<'artist_airs'>;
type ArtistAirUpdate = TablesUpdate<'artist_airs'>;

export const useArtistAirs = (artistProfileId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: airs, isLoading, error } = useQuery({
    queryKey: ['artist-airs', artistProfileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_airs')
        .select('*')
        .eq('artist_profile_id', artistProfileId)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching artist airs:', error);
        throw error;
      }

      return data as ArtistAir[];
    },
    enabled: !!artistProfileId,
  });

  const createMutation = useMutation({
    mutationFn: async (airData: Omit<ArtistAirInsert, 'artist_profile_id'>) => {
      const { data, error } = await supabase
        .from('artist_airs')
        .insert({
          ...airData,
          artist_profile_id: artistProfileId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-airs', artistProfileId] });
      toast({
        title: "Air ajouté",
        description: "L'air a été ajouté avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error creating air:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'air.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ArtistAirUpdate }) => {
      const { data, error } = await supabase
        .from('artist_airs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-airs', artistProfileId] });
      toast({
        title: "Air mis à jour",
        description: "L'air a été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error updating air:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'air.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('artist_airs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-airs', artistProfileId] });
      toast({
        title: "Air supprimé",
        description: "L'air a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error deleting air:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'air.",
        variant: "destructive",
      });
    },
  });

  const uploadFile = async (file: File, userId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('artist-airs')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    return fileName;
  };

  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from('artist-airs')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const deleteFile = async (filePath: string) => {
    const { error } = await supabase.storage
      .from('artist-airs')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
    }
  };

  return {
    airs: airs || [],
    isLoading,
    error,
    createAir: createMutation.mutate,
    updateAir: updateMutation.mutate,
    deleteAir: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadFile,
    getFileUrl,
    deleteFile,
  };
};
