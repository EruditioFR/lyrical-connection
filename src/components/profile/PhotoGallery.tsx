
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Star, Image as ImageIcon } from 'lucide-react';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface PhotoGalleryProps {
  artistProfileId: string;
}

const PhotoGallery = ({ artistProfileId }: PhotoGalleryProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    photos,
    isLoading,
    uploading,
    uploadPhoto,
    deletePhoto,
    setAsProfilePhoto,
    getPhotoUrl,
    isDeleting,
    isSettingProfilePhoto,
  } = useArtistPhotos(artistProfileId);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 5MB');
      return;
    }

    const isFirstPhoto = !photos || photos.length === 0;
    await uploadPhoto(file, isFirstPhoto);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const profilePhoto = photos?.find(photo => photo.is_profile_photo);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Galerie Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Galerie Photos
          <Badge variant="secondary">{photos?.length || 0}/20</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Photo de profil */}
        <div>
          <h3 className="text-lg font-medium mb-3">Photo de profil</h3>
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              {profilePhoto ? (
                <AvatarImage 
                  src={getPhotoUrl(profilePhoto.file_path)} 
                  alt="Photo de profil" 
                />
              ) : (
                <AvatarFallback>
                  <ImageIcon className="h-8 w-8" />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">
                {profilePhoto 
                  ? "Photo de profil actuelle" 
                  : "Aucune photo de profil définie"
                }
              </p>
              {!profilePhoto && photos && photos.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Cliquez sur l'étoile d'une photo pour la définir comme photo de profil
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Upload de nouvelles photos */}
        <div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || (photos?.length || 0) >= 20}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Upload en cours...' : 'Ajouter une photo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Formats acceptés: JPG, PNG, GIF. Taille max: 5MB.
          </p>
        </div>

        {/* Galerie des photos */}
        {photos && photos.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Toutes les photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={getPhotoUrl(photo.file_path)}
                      alt={photo.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant={photo.is_profile_photo ? "default" : "secondary"}
                      onClick={() => setAsProfilePhoto(photo.id)}
                      disabled={isSettingProfilePhoto}
                    >
                      <Star className={`h-4 w-4 ${photo.is_profile_photo ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deletePhoto(photo.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Badge photo de profil */}
                  {photo.is_profile_photo && (
                    <Badge className="absolute top-2 left-2 bg-primary">
                      Profil
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {photos && photos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune photo dans votre galerie</p>
            <p className="text-sm">Ajoutez votre première photo pour commencer</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoGallery;
