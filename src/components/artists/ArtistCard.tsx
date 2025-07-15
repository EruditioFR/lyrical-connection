
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, User, MessageSquare, UserPlus } from 'lucide-react';
import ContactArtistDialog from './ContactArtistDialog';
import InviteArtistDialog from './InviteArtistDialog';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';

interface ArtistCardProps {
  artist: any; // Replace 'any' with a more specific type if possible
  showContactButton?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, showContactButton = false }) => {
  const { photos, getPhotoUrl } = useArtistPhotos(artist.id);
  const profilePhoto = photos?.find(photo => photo.is_profile_photo);
  
  // Utiliser la photo de profil de la galerie ou l'ancienne URL en fallback
  const imageUrl = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : artist.profile_image_url;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        
        {/* Photo ou placeholder */}
        <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-gray-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={artist.stage_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-accent/20">
              <User className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Badge type de voix */}
        {artist.voice_type && (
          <Badge className="absolute top-3 left-3 bg-white/90 text-gray-700 hover:bg-white">
            {artist.voice_type}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Nom et localisation */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {artist.stage_name}
            </h3>
            {artist.location && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {artist.location}
              </p>
            )}
          </div>

          {/* Bio (tronquée) */}
          {artist.bio && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {artist.bio}
            </p>
          )}

          {/* Expérience */}
          {artist.experience_years !== null && artist.experience_years > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              {artist.experience_years} ans d'expérience
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button asChild className="flex-1">
              <Link to={`/artistes/${artist.id}`}>
                Voir le profil
              </Link>
            </Button>
            
            {showContactButton && (
              <div className="flex gap-1">
                <ContactArtistDialog
                  artistId={artist.id}
                  artistName={artist.stage_name}
                  trigger={
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  }
                />
                <InviteArtistDialog
                  artistId={artist.id}
                  artistName={artist.stage_name}
                  trigger={
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
