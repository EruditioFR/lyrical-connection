
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlayCircle, Loader2 } from 'lucide-react';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';

interface ArtistCardProps {
  artist: any;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const { photos, getPhotoUrl, isLoading: photosLoading } = useArtistPhotos(artist.id);
  
  console.log('ArtistCard - Artist data:', artist);
  console.log('ArtistCard - Photos for artist', artist.id, ':', photos);
  console.log('ArtistCard - Photos loading:', photosLoading);
  
  // Trouver la photo de profil ou prendre la première photo
  const profilePhoto = photos?.find(photo => photo.is_profile_photo) || photos?.[0];
  const imageUrl = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : artist.profile_image_url;
  
  console.log('ArtistCard - Profile photo:', profilePhoto);
  console.log('ArtistCard - Image URL:', imageUrl);
  
  // Image par défaut si aucune photo
  const defaultImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';
  
  return (
    <div className="group rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border">
      <Link to={`/artistes/${artist.id}`} className="block relative aspect-[3/4] overflow-hidden">
        {photosLoading ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <img 
            src={imageUrl || defaultImage} 
            alt={artist.stage_name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              console.log('Image error for artist', artist.stage_name, 'trying default image');
              e.currentTarget.src = defaultImage;
            }}
            onLoad={() => {
              console.log('Image loaded successfully for artist', artist.stage_name);
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
          <Button 
            size="sm" 
            className="mb-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Écouter
          </Button>
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
          <Link to={`/artistes/${artist.id}`}>{artist.stage_name}</Link>
        </h3>
        <p className="text-muted-foreground text-sm">{artist.voice_type || 'Non spécifié'}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {artist.repertoire && artist.repertoire.length > 0 
              ? artist.repertoire.slice(0, 2).join(', ') 
              : 'Répertoire à découvrir'
            }
          </p>
          <p className="text-xs text-muted-foreground">{artist.location || 'France'}</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
