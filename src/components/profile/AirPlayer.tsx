
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, ExternalLink, Music, Video, Link } from 'lucide-react';
import { useArtistAirs } from '@/hooks/useArtistAirs';
import VideoPlayerModal from './VideoPlayerModal';

interface AirPlayerProps {
  artistProfileId: string;
}

const AirPlayer: React.FC<AirPlayerProps> = ({ artistProfileId }) => {
  const { airs, isLoading, getFileUrl } = useArtistAirs(artistProfileId);
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Record<string, HTMLAudioElement>>({});
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  const activeAirs = airs.filter(air => air.is_active);

  const handlePlayPause = (air: any) => {
    const airId = air.id;
    
    // Arrêter tous les autres audios
    Object.values(audioElements).forEach(audio => {
      if (audio.src !== getAudioUrl(air)) {
        audio.pause();
      }
    });

    let audio = audioElements[airId];
    
    if (!audio) {
      audio = new Audio(getAudioUrl(air));
      audio.addEventListener('ended', () => {
        setCurrentPlaying(null);
      });
      setAudioElements(prev => ({ ...prev, [airId]: audio }));
    }

    if (currentPlaying === airId) {
      audio.pause();
      setCurrentPlaying(null);
    } else {
      audio.play();
      setCurrentPlaying(airId);
    }
  };

  const getAudioUrl = (air: any) => {
    if (air.type === 'url') {
      return air.external_url;
    } else if (air.file_path) {
      return getFileUrl(air.file_path);
    }
    return '';
  };

  const getAirIcon = (type: string) => {
    switch (type) {
      case 'audio': return Music;
      case 'video': return Video;
      case 'url': return Link;
      default: return Music;
    }
  };

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleVideoPlay = (air: any) => {
    setSelectedVideo(air);
    setVideoModalOpen(true);
  };

  const getVideoUrl = (air: any) => {
    if (air.type === 'url') {
      return air.external_url;
    } else if (air.file_path) {
      return getFileUrl(air.file_path);
    }
    return '';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ecouter les prestations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (activeAirs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ecouter les prestations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {activeAirs.map((air) => {
            const IconComponent = getAirIcon(air.type);
            const isPlaying = currentPlaying === air.id;
            
            return (
              <div key={air.id} className="flex flex-col p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="text-center">
                  <h4 className="font-medium text-sm truncate">{air.title}</h4>
                  {air.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{air.description}</p>
                  )}
                </div>
                
                <div className="flex justify-center">
                  {air.type === 'audio' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePlayPause(air)}
                      className="w-full"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {air.type === 'video' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoPlay(air)}
                      className="w-full"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {air.type === 'url' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Si l'URL contient des mots-clés vidéo, ouvrir dans la modale
                        const isVideoUrl = air.external_url && (
                          air.external_url.includes('youtube') ||
                          air.external_url.includes('vimeo') ||
                          air.external_url.includes('dailymotion') ||
                          air.external_url.includes('.mp4') ||
                          air.external_url.includes('.webm') ||
                          air.external_url.includes('.mov')
                        );
                        
                        if (isVideoUrl) {
                          handleVideoPlay(air);
                        } else {
                          openExternalLink(air.external_url!);
                        }
                      }}
                      className="w-full"
                    >
                      {air.external_url && (
                        air.external_url.includes('youtube') ||
                        air.external_url.includes('vimeo') ||
                        air.external_url.includes('dailymotion') ||
                        air.external_url.includes('.mp4') ||
                        air.external_url.includes('.webm') ||
                        air.external_url.includes('.mov')
                      ) ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modale pour le player vidéo */}
        {selectedVideo && (
          <VideoPlayerModal
            isOpen={videoModalOpen}
            onClose={() => {
              setVideoModalOpen(false);
              setSelectedVideo(null);
            }}
            videoSrc={getVideoUrl(selectedVideo)}
            title={selectedVideo.title}
            description={selectedVideo.description}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AirPlayer;
