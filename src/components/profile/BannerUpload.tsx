
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Camera, Video } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BannerUploadProps {
  currentBannerUrl?: string;
  onBannerChange: (url: string | null) => void;
}

const BannerUpload: React.FC<BannerUploadProps> = ({ currentBannerUrl, onBannerChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  // Fonction pour détecter si le fichier est une vidéo
  const isVideo = (url: string) => {
    return url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('video');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Vérifier le type de fichier (image ou vidéo MP4)
    const isImageFile = file.type.startsWith('image/');
    const isVideoFile = file.type === 'video/mp4';
    
    if (!isImageFile && !isVideoFile) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une image ou une vidéo MP4 valide.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la taille du fichier (max 10MB pour les vidéos, 5MB pour les images)
    const maxSize = isVideoFile ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Erreur",
        description: `Le fichier ne doit pas dépasser ${isVideoFile ? '10MB' : '5MB'}.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Supprimer l'ancienne bannière si elle existe
      if (currentBannerUrl) {
        const oldPath = currentBannerUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('artist-banners')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload de la nouvelle bannière
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('artist-banners')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data } = supabase.storage
        .from('artist-banners')
        .getPublicUrl(filePath);

      onBannerChange(data.publicUrl);

      toast({
        title: "Bannière mise à jour",
        description: "Votre bannière a été mise à jour avec succès.",
      });

    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader la bannière.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeBanner = async () => {
    if (!currentBannerUrl || !user) return;

    try {
      const fileName = currentBannerUrl.split('/').pop();
      if (fileName) {
        const { error } = await supabase.storage
          .from('artist-banners')
          .remove([`${user.id}/${fileName}`]);

        if (error) throw error;
      }

      onBannerChange(null);

      toast({
        title: "Bannière supprimée",
        description: "La bannière a été supprimée.",
      });

    } catch (error) {
      console.error('Error removing banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la bannière.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Bannière de profil
        </CardTitle>
        <CardDescription>
          Ajoutez une image ou une vidéo MP4 comme bannière (format recommandé : 1200x400px)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentBannerUrl ? (
          <div className="relative">
            <div className="w-full h-40 md:h-48 rounded-lg overflow-hidden bg-muted">
              {isVideo(currentBannerUrl) ? (
                <video 
                  src={currentBannerUrl} 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={currentBannerUrl} 
                  alt="Bannière actuelle" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeBanner}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full h-40 md:h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                <Camera className="h-6 w-6 text-muted-foreground" />
                <Video className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucune bannière définie</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="relative overflow-hidden"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Upload...' : 'Changer la bannière'}
            <input
              type="file"
              accept="image/*,video/mp4"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerUpload;
