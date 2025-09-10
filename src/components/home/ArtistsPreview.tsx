import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, ArrowRight, MapPin, User, Mic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardArtist } from '@/hooks/useDashboardData';

interface ArtistsPreviewProps {
  artists: DashboardArtist[];
  isLoading: boolean;
}

const ArtistsPreview: React.FC<ArtistsPreviewProps> = ({ artists, isLoading }) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleArtistClick = (artistId: string) => {
    navigate(`/artistes/${artistId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Les artistes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Mic className="h-5 w-5 mr-2" />
            Les artistes
          </CardTitle>
          <Link to="/artistes">
            <Button variant="ghost" size="sm">
              Voir tout
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {artists.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Aucun artiste disponible pour le moment
            </p>
            <Link to="/artistes">
              <Button variant="outline" size="sm">
                Explorer les artistes
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {artists.map((artist) => (
              <div 
                key={artist.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleArtistClick(artist.id)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={artist.profile_image_url || ''} />
                  <AvatarFallback>
                    {getInitials(artist.stage_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {artist.stage_name}
                    </p>
                    {artist.public_visibility_premium && (
                      <Badge variant="secondary" className="text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  {artist.voice_type && (
                    <p className="text-xs text-primary font-medium mb-1">
                      {artist.voice_type}
                    </p>
                  )}
                  
                  {artist.location && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {artist.location}
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArtistClick(artist.id);
                  }}
                >
                  <User className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <div className="pt-3 border-t">
              <Link to="/artistes" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  <Mic className="h-4 w-4 mr-2" />
                  Explorer tous les artistes
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistsPreview;