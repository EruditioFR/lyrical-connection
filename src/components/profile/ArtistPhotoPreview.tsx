import React from 'react';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ImageIcon } from 'lucide-react';

interface ArtistPhotoPreviewProps {
  artistProfileId: string;
}

const ArtistPhotoPreview = ({ artistProfileId }: ArtistPhotoPreviewProps) => {
  const { photos, isLoading, getPhotoUrl } = useArtistPhotos(artistProfileId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-lg">
        <ImageIcon className="h-8 w-8 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Aucune photo</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {photos.slice(0, 6).map((photo) => (
        <div key={photo.id} className="group cursor-pointer">
          <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
            <img
              src={getPhotoUrl(photo.file_path)}
              alt={photo.file_name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          </AspectRatio>
        </div>
      ))}
      
      {photos.length > 6 && (
        <div className="col-span-2 text-center">
          <p className="text-sm text-muted-foreground">
            +{photos.length - 6} photos supplémentaires
          </p>
        </div>
      )}
    </div>
  );
};

export default ArtistPhotoPreview;