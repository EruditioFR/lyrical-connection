import React from 'react';
import PhotoGallery from './PhotoGallery';
interface PhotosTabProps {
  artistProfileId: string;
}
const PhotosTab = ({
  artistProfileId
}: PhotosTabProps) => {
  return <div className="space-y-6">
      <div>
        
        
        <PhotoGallery artistProfileId={artistProfileId} />
      </div>
    </div>;
};
export default PhotosTab;