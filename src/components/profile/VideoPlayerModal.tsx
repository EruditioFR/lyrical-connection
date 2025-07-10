import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from 'lucide-react';

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
  const [error, setError] = useState(false);

  // Détection du type de vidéo et conversion en URL d'embed
  const getVideoInfo = (url: string) => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&controls=1&rel=0`
      };
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&controls=1`
      };
    }

    // Dailymotion
    const dailymotionRegex = /(?:dailymotion\.com\/video\/)([^_\s]+)/;
    const dailymotionMatch = url.match(dailymotionRegex);
    if (dailymotionMatch) {
      return {
        type: 'dailymotion',
        embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}?autoplay=1&controls=1`
      };
    }

    // Vidéo directe (fichier mp4, webm, etc.)
    return {
      type: 'direct',
      embedUrl: url
    };
  };

  const videoInfo = getVideoInfo(videoSrc);

  const renderPlayer = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <AlertTriangle className="h-12 w-12 mb-4 text-yellow-500" />
          <p className="text-lg mb-2">Impossible de charger la vidéo</p>
          <p className="text-sm text-gray-300 mb-4">Vérifiez l'URL ou essayez un autre format</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(videoSrc, '_blank')}
            className="text-white border-white/20 hover:bg-white/10"
          >
            Ouvrir dans un nouvel onglet
          </Button>
        </div>
      );
    }

    if (videoInfo.type === 'direct') {
      return (
        <video
          controls
          autoPlay
          className="w-full h-full"
          src={videoInfo.embedUrl}
          onError={() => setError(true)}
        >
          <track kind="captions" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }

    // Vidéos externes (YouTube, Vimeo, Dailymotion)
    return (
      <iframe
        src={videoInfo.embedUrl}
        className="w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onError={() => setError(true)}
        title={title}
      />
    );
  };

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
            <p className="text-xs text-gray-400 mt-1 capitalize">
              {videoInfo.type === 'direct' ? 'Vidéo directe' : videoInfo.type}
            </p>
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
          {renderPlayer()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;