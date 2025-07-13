
import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Play, Volume2, Image as ImageIcon } from 'lucide-react';

interface EventMediaGalleryProps {
  media: any[];
  getMediaUrl: (filePath: string) => string;
  onVideoClick: (videoSrc: string, title: string, description?: string) => void;
  onAudioClick: (audioSrc: string) => void;
}

const EventMediaGallery: React.FC<EventMediaGalleryProps> = ({
  media,
  getMediaUrl,
  onVideoClick,
  onAudioClick
}) => {
  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'audio':
        return <Volume2 className="h-4 w-4" />;
      default:
        return <ImageIcon className="h-4 w-4" />;
    }
  };

  const isVideoUrl = (url: string) => {
    return url.startsWith('http') && (url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('youtu.be') || url.includes('dailymotion.com') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg'));
  };

  if (!media || media.length === 0) return null;

  return (
    <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h2 className="text-2xl font-serif font-semibold mb-4">Galerie média</h2>
      <Carousel className="w-full">
        <CarouselContent>
          {media.map((item, index) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden group cursor-pointer">
                {item.media_type === 'photo' ? (
                  <img
                    src={getMediaUrl(item.file_path)}
                    alt={item.title || 'Media'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onClick={() => window.open(getMediaUrl(item.file_path), '_blank')}
                  />
                ) : item.media_type === 'video' ? (
                  <div 
                    className="w-full h-full bg-black flex items-center justify-center"
                    onClick={() => onVideoClick(getMediaUrl(item.file_path), item.title || 'Vidéo', item.description)}
                  >
                    {isVideoUrl(item.file_path) ? (
                      <div className="relative w-full h-full">
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Play className="h-16 w-16 mx-auto mb-2 text-white/80" />
                            <p className="text-sm font-medium">{item.title || 'Vidéo'}</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                          <Play className="h-12 w-12 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    ) : (
                      <video
                        src={getMediaUrl(item.file_path)}
                        className="w-full h-full object-cover"
                        muted
                        preload="metadata"
                      />
                    )}
                  </div>
                ) : (
                  <div 
                    className="w-full h-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => onAudioClick(getMediaUrl(item.file_path))}
                  >
                    <div className="text-center">
                      <Volume2 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">
                        {item.title || 'Audio'}
                      </p>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs">
                    {getMediaIcon(item.media_type)}
                    <span className="ml-1 capitalize">{item.media_type}</span>
                  </Badge>
                </div>
                {item.title && item.media_type !== 'video' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium">{item.title}</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};

export default EventMediaGallery;
