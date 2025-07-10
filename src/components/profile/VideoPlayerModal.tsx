import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
  description?: string;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  title,
  description
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        
        {/* Header avec titre et bouton fermer */}
        <div className="flex items-center justify-between p-4 bg-black/80 text-white">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-gray-300 mt-1">{description}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Player vidéo */}
        <div className="relative aspect-video bg-black">
          <video
            controls
            autoPlay
            className="w-full h-full"
            src={videoSrc}
            onError={(e) => {
              console.error('Erreur de lecture vidéo:', e);
            }}
          >
            <track kind="captions" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;