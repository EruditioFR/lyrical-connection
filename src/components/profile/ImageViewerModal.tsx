import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageTitle: string;
}

const ImageViewerModal = ({ isOpen, onClose, imageSrc, imageTitle }: ImageViewerModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0 bg-black/95 border-none">
        <DialogHeader className="absolute top-4 left-4 right-4 z-10 text-white">
          <DialogTitle className="sr-only">{imageTitle}</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </DialogHeader>
        
        <div className="flex items-center justify-center h-full p-4">
          <img
            src={imageSrc}
            alt={imageTitle}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerModal;