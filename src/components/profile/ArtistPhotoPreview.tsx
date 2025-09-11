import React, { useState } from 'react';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ImageViewerModal from './ImageViewerModal';

interface ArtistPhotoPreviewProps {
  artistProfileId: string;
}

const ArtistPhotoPreview = ({ artistProfileId }: ArtistPhotoPreviewProps) => {
  const { photos, isLoading, getPhotoUrl } = useArtistPhotos(artistProfileId);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const photosPerPage = 6;
  const totalPages = photos ? Math.ceil(photos.length / photosPerPage) : 0;
  
  // Calculer les photos à afficher pour la page courante
  const startIndex = (currentPage - 1) * photosPerPage;
  const endIndex = startIndex + photosPerPage;
  const currentPhotos = photos?.slice(startIndex, endIndex) || [];

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

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
    <>
      <div className="space-y-4">
        {/* Grille de photos */}
        <div className="grid grid-cols-2 gap-3">
          {currentPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="group cursor-pointer"
              onClick={() => setSelectedImage({
                src: getPhotoUrl(photo.file_path) || '',
                title: photo.file_name
              })}
            >
              <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
                <img
                  src={getPhotoUrl(photo.file_path)}
                  alt={photo.file_name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </AspectRatio>
            </div>
          ))}
        </div>
        
        {/* Contrôles de pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      <ImageViewerModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageSrc={selectedImage?.src || ''}
        imageTitle={selectedImage?.title || ''}
      />
    </>
  );
};

export default ArtistPhotoPreview;