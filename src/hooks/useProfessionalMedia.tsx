
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type ProfessionalMedia = Tables<'professional_media'>;
type ProfessionalMediaInsert = TablesInsert<'professional_media'>;

export const useProfessionalMedia = (profileId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: media = [], isLoading } = useQuery({
    queryKey: ['professional-media', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('professional_media')
        .select('*')
        .eq('professional_profile_id', profileId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const uploadFile = async (file: File, mediaType: 'photo' | 'video' | 'audio', title?: string, description?: string) => {
    if (!profileId || !user) throw new Error('Profile ID and user required');
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profileId}/${mediaType}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('professional-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const mediaData: Omit<ProfessionalMediaInsert, 'professional_profile_id'> = {
        media_type: mediaType,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        title: title || file.name,
        description,
      };

      const { error: dbError } = await supabase
        .from('professional_media')
        .insert({
          ...mediaData,
          professional_profile_id: profileId,
        });

      if (dbError) throw dbError;

      toast({
        title: "Fichier uploadé",
        description: "Votre média a été ajouté avec succès.",
      });

      queryClient.invalidateQueries({ queryKey: ['professional-media', profileId] });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader le fichier.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const addExternalLink = async (mediaType: 'photo' | 'video' | 'audio', url: string, title?: string, description?: string) => {
    if (!profileId || !user) throw new Error('Profile ID and user required');
    
    setUploading(true);
    try {
      const mediaData: Omit<ProfessionalMediaInsert, 'professional_profile_id'> = {
        media_type: mediaType,
        file_name: title || 'Lien externe',
        file_path: url, // Utiliser file_path pour stocker l'URL
        file_size: null,
        mime_type: null,
        title: title || 'Lien externe',
        description,
      };

      const { error: dbError } = await supabase
        .from('professional_media')
        .insert({
          ...mediaData,
          professional_profile_id: profileId,
        });

      if (dbError) throw dbError;

      toast({
        title: "Lien ajouté",
        description: "Votre lien a été ajouté avec succès.",
      });

      queryClient.invalidateQueries({ queryKey: ['professional-media', profileId] });
    } catch (error) {
      console.error('Error adding external link:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le lien.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = useMutation({
    mutationFn: async (mediaId: string) => {
      const media = await supabase
        .from('professional_media')
        .select('file_path')
        .eq('id', mediaId)
        .single();

      // Supprimer le fichier du storage seulement si ce n'est pas une URL externe
      if (media.data?.file_path && !media.data.file_path.startsWith('http')) {
        await supabase.storage
          .from('professional-media')
          .remove([media.data.file_path]);
      }

      const { error } = await supabase
        .from('professional_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Média supprimé",
        description: "Le média a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ['professional-media', profileId] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le média.",
        variant: "destructive",
      });
    },
  });

  const getMediaUrl = (filePath: string) => {
    // Si c'est une URL externe, la retourner directement
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // Sinon, générer l'URL du storage Supabase
    const { data } = supabase.storage
      .from('professional-media')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    media,
    isLoading,
    uploading,
    uploadFile,
    addExternalLink,
    deleteMedia: deleteMedia.mutate,
    getMediaUrl,
  };
};
