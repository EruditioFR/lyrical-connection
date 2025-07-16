
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Artist } from '@/hooks/useArtists';
import ChatButton from '@/components/messaging/ChatButton';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
  showContactInfo?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  onClick, 
  showContactInfo = false 
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick && !e.defaultPrevented) {
      onClick();
    }
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer group" 
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {artist.stage_name}
            </h3>
            
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

        {showContactInfo && (
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

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
          >
            Voir le profil
          </Button>

          <ChatButton
            targetUserId={artist.user_id}
            targetName={artist.stage_name}
            variant="outline"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
