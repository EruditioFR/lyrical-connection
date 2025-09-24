
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Calendar, Globe, Mail, Phone, MessageCircle, Crown, Volume2, Loader2, Heart, BarChart3, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Artist } from '@/hooks/useArtists';
import { useArtistAudioPreview } from '@/hooks/useArtistAudioPreview';
import { useArtistFavorites } from '@/hooks/useArtistFavorites';
import { useArtistEvaluations } from '@/hooks/useArtistEvaluations';
import ArtistEvaluationDialog from './ArtistEvaluationDialog';
import EvaluationChart from './EvaluationChart';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
  showContactInfo?: boolean;
  isUserAuthenticated?: boolean;
  professionalProfileId?: string;
  showProfessionalActions?: boolean;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  onClick, 
  showContactInfo = false,
  isUserAuthenticated = true,
  professionalProfileId,
  showProfessionalActions = false
}) => {
  const navigate = useNavigate();
  const { startAudioPreview, stopAudioPreview, isPlaying, isAnalyzing, hasAudioTracks } = useArtistAudioPreview(artist.id);
  const { isFavorite, toggleFavorite } = useArtistFavorites(professionalProfileId);
  const { getEvaluation } = useArtistEvaluations(professionalProfileId);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if (onClick && !e.defaultPrevented) {
      onClick();
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/artistes/${artist.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (professionalProfileId) {
      await toggleFavorite.mutateAsync(artist.id);
    }
  };

  const handleOpenEvaluation = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEvaluationDialog(true);
  };

  const evaluation = professionalProfileId ? getEvaluation(artist.id) : null;
  const isFav = professionalProfileId ? isFavorite(artist.id) : false;

  const getAverageScore = () => {
    if (!evaluation) return null;
    const scores = [
      evaluation.vocal_quality,
      evaluation.vocal_technique,
      evaluation.stage_presence,
      evaluation.language_mastery,
      evaluation.pitch_accuracy
    ].filter(score => score !== null && score !== undefined) as number[];
    
    if (scores.length === 0) return null;
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;
  };

  const averageScore = getAverageScore();

  return (
    <Card 
      className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isPlaying ? 'ring-2 ring-primary shadow-lg' : ''
      } ${
        isAnalyzing ? 'ring-2 ring-muted-foreground/50' : ''
      }`}
      onClick={handleCardClick}
      onMouseEnter={hasAudioTracks ? startAudioPreview : undefined}
      onMouseLeave={hasAudioTracks ? stopAudioPreview : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="artist-name-card flex items-center gap-2">
                {artist.stage_name}
                {isPlaying && (
                  <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                )}
                {isAnalyzing && (
                  <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                )}
                {showProfessionalActions && isFav && (
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                )}
              </h3>
              {artist.public_visibility_premium && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
              {showProfessionalActions && averageScore && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {averageScore}/10
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

        {/* Diagramme d'évaluation */}
        {showProfessionalActions && evaluation && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="text-sm font-medium text-center mb-2">Évaluation</div>
            <div className="flex justify-center">
              <EvaluationChart evaluation={evaluation} size={100} />
            </div>
          </div>
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
          <div className="space-y-2">
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

            {showProfessionalActions && professionalProfileId && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={toggleFavorite.isPending}
                  className={isFav ? "text-red-600 border-red-200 hover:bg-red-50" : ""}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFav ? 'Favori' : 'Favoris'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEvaluation}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Évaluer
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Aperçu limité - Inscrivez-vous pour plus d'informations
            </p>
          </div>
        )}

        {showEvaluationDialog && professionalProfileId && (
          <ArtistEvaluationDialog
            isOpen={showEvaluationDialog}
            onClose={() => setShowEvaluationDialog(false)}
            artistProfileId={artist.id}
            artistName={artist.stage_name}
            professionalProfileId={professionalProfileId}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
