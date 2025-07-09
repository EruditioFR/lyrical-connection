
import React from 'react';
import PhotoGallery from './PhotoGallery';

interface PhotosTabProps {
  artistProfileId: string;
}

const PhotosTab = ({ artistProfileId }: PhotosTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Galerie photos</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Gérez vos photos de profil et votre galerie d'images
        </p>
        <PhotoGallery artistProfileId={artistProfileId} />
      </div>
    </div>
  );
};

export default PhotosTab;
