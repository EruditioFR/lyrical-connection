
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ArtistPhoto {
  id: string;
  artist_profile_id: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  is_profile_photo: boolean;
  display_order: number;
  created_at: string;
}

export const useArtistPhotos = (artistProfileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: photos, isLoading } = useQuery({
    queryKey: ['artist-photos', artistProfileId],
    queryFn: async () => {
      if (!artistProfileId) return [];
      
      const { data, error } = await supabase
        .from('artist_photos')
        .select('*')
        .eq('artist_profile_id', artistProfileId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as ArtistPhoto[];
    },
    enabled: !!artistProfileId,
  });

  const uploadPhoto = async (file: File, isProfilePhoto = false) => {
    if (!user?.id || !artistProfileId) {
      throw new Error('User not authenticated or profile not found');
    }

    setUploading(true);
    try {
      // Vérifier le nombre de photos existantes
      const existingPhotos = photos || [];
      if (existingPhotos.length >= 20) {
        throw new Error('Vous ne pouvez pas ajouter plus de 20 photos');
      }

      // Upload du fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Si c'est une photo de profil, retirer le statut des autres photos
      if (isProfilePhoto) {
        await supabase
          .from('artist_photos')
          .update({ is_profile_photo: false })
          .eq('artist_profile_id', artistProfileId);
      }

      // Enregistrer les métadonnées en base
      const { error: dbError } = await supabase
        .from('artist_photos')
        .insert({
          artist_profile_id: artistProfileId,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          is_profile_photo: isProfilePhoto,
          display_order: existingPhotos.length,
        });

      if (dbError) throw dbError;

      // Recharger les photos
      queryClient.invalidateQueries({ queryKey: ['artist-photos', artistProfileId] });
      
      toast({
        title: "Photo ajoutée",
        description: "Votre photo a été uploadée avec succès.",
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'uploader la photo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      const photo = photos?.find(p => p.id === photoId);
      if (!photo) throw new Error('Photo not found');

      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from('artist-photos')
        .remove([photo.file_path]);

      if (storageError) throw storageError;

      // Supprimer l'entrée de la base de données
      const { error: dbError } = await supabase
        .from('artist_photos')
        .delete()
        .eq('id', photoId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-photos', artistProfileId] });
      toast({
        title: "Photo supprimée",
        description: "La photo a été supprimée avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error deleting photo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo.",
        variant: "destructive",
      });
    },
  });

  const setAsProfilePhoto = useMutation({
    mutationFn: async (photoId: string) => {
      // Retirer le statut de photo de profil des autres photos
      await supabase
        .from('artist_photos')
        .update({ is_profile_photo: false })
        .eq('artist_profile_id', artistProfileId);

      // Définir cette photo comme photo de profil
      const { error } = await supabase
        .from('artist_photos')
        .update({ is_profile_photo: true })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-photos', artistProfileId] });
      toast({
        title: "Photo de profil mise à jour",
        description: "La photo de profil a été définie avec succès.",
      });
    },
    onError: (error) => {
      console.error('Error setting profile photo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de définir la photo de profil.",
        variant: "destructive",
      });
    },
  });

  const getPhotoUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('artist-photos')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    photos,
    isLoading,
    uploading,
    uploadPhoto,
    deletePhoto: deletePhoto.mutate,
    setAsProfilePhoto: setAsProfilePhoto.mutate,
    getPhotoUrl,
    isDeleting: deletePhoto.isPending,
    isSettingProfilePhoto: setAsProfilePhoto.isPending,
  };
};
