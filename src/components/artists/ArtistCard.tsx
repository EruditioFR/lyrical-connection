
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Globe, Mail, Phone, MessageCircle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Artist } from '@/hooks/useArtists';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
  showContactInfo?: boolean;
  isUserAuthenticated?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  onClick, 
  showContactInfo = false,
  isUserAuthenticated = true
}) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick && !e.defaultPrevented) {
      onClick();
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artistes/${artist.id}`);
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group" 
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="artist-name-card">
                {artist.stage_name}
              </h3>
              {artist.public_visibility_premium && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            
            {artist.voice_type && (
              <Badge variant="secondary" className="mb-2">
                {artist.voice_type}
              </Badge>
            )}
            
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              {artist.location || 'Lieu non spécifié'}
            </div>
          </div>

          <div className="ml-4">
            {artist.profile_image_url ? (
              <img
                src={artist.profile_image_url}
                alt={artist.stage_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {artist.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {artist.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {artist.experience_years && (
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {artist.experience_years} ans d'expérience
            </div>
          )}
          
          {artist.nationality && (
            <Badge variant="outline" className="text-xs">
              {artist.nationality}
            </Badge>
          )}
        </div>

        {showContactInfo && isUserAuthenticated && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
            {artist.contact_email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                <a 
                  href={`mailto:${artist.contact_email}`}
                  className="hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {artist.contact_email}
                </a>
              </div>
            )}
            
            {artist.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <a 
                  href={`tel:${artist.phone}`}
                  className="hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {artist.phone}
                </a>
              </div>
            )}
            
            {artist.website && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="w-4 h-4 mr-2" />
                <a 
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Site web
                </a>
              </div>
            )}
          </div>
        )}

        {!isUserAuthenticated && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Connectez-vous pour voir les coordonnées et contacter cet artiste
            </p>
          </div>
        )}

        {isUserAuthenticated ? (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
            >
              Voir le profil
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('Contact artist:', artist.stage_name);
              }}
            >
              <MessageCircle className="w-4 w-4 mr-1" />
              Contacter
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Aperçu limité - Inscrivez-vous pour plus d'informations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
