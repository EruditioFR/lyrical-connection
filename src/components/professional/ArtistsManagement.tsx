import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useArtists } from '@/hooks/useArtists';
import { useArtistFavorites } from '@/hooks/useArtistFavorites';
import { useArtistEvaluations } from '@/hooks/useArtistEvaluations';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { Heart, BarChart3, Users } from 'lucide-react';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';
import ArtistCard from '@/components/artists/ArtistCard';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';
import { Skeleton } from '@/components/ui/skeleton';

const ArtistsManagement = () => {
  const { profile: professionalProfile } = useProfessionalProfile();
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [location, setLocation] = useState('');
  const [repertoireFilters, setRepertoireFilters] = useState<RepertoireFilters>({});

  const { artists, isLoading } = useArtists({
    voiceType: voiceType || undefined,
    isUserAuthenticated: true,
    ...repertoireFilters
  });

  const { favorites, isLoading: favoriteLoading } = useArtistFavorites(professionalProfile?.id);
  const { evaluations, isLoading: evaluationsLoading } = useArtistEvaluations(professionalProfile?.id);

  // Filtrer côté client
  const filteredArtists = artists.filter(artist => {
    const searchMatch = !searchTerm || 
      artist.stage_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.voice_type && artist.voice_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artist.location && artist.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const locationMatch = !location || 
      (artist.location && artist.location.toLowerCase().includes(location.toLowerCase()));

    return searchMatch && locationMatch;
  });

  // Artistes favoris
  const favoriteArtists = filteredArtists.filter(artist => 
    favorites.some(fav => fav.artist_profile_id === artist.id)
  );

  // Artistes évalués
  const evaluatedArtists = filteredArtists.filter(artist => 
    evaluations.some(evaluation => evaluation.artist_profile_id === artist.id)
  );

  const resetFilters = () => {
    setSearchTerm('');
    setVoiceType('');
    setLocation('');
    setRepertoireFilters({});
  };

  if (!professionalProfile) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
          <Users className="h-16 w-16 text-muted-foreground/50" />
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">Créez votre profil professionnel</h3>
            <p className="text-muted-foreground max-w-md">
              Pour accéder à la gestion des artistes, vous devez d'abord compléter votre profil professionnel
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/profile">Créer mon profil</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des Artistes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            voiceType={voiceType}
            onVoiceTypeChange={setVoiceType}
            location={location}
            onLocationChange={setLocation}
            repertoireFilters={repertoireFilters}
            onRepertoireFiltersChange={setRepertoireFilters}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tous les artistes ({filteredArtists.length})
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favoris ({favoriteArtists.length})
          </TabsTrigger>
          <TabsTrigger value="evaluated" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Évalués ({evaluatedArtists.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ArtistsGrid
            artists={artists}
            filteredArtists={filteredArtists}
            isLoading={isLoading}
            searchQuery={searchTerm}
            selectedVoiceTypes={voiceType ? [voiceType] : []}
            onResetFilters={resetFilters}
            isUserAuthenticated={true}
            professionalProfileId={professionalProfile.id}
            showProfessionalActions={true}
          />
        </TabsContent>

        <TabsContent value="favorites">
          {favoriteLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : favoriteArtists.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
                  <p className="text-muted-foreground">
                    Ajoutez des artistes à vos favoris pour les retrouver facilement
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favoriteArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  isUserAuthenticated={true}
                  professionalProfileId={professionalProfile.id}
                  showProfessionalActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="evaluated">
          {evaluationsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          ) : evaluatedArtists.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Aucune évaluation</h3>
                  <p className="text-muted-foreground">
                    Évaluez des artistes pour garder une trace de vos impressions
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {evaluatedArtists.map((artist) => (
                <ArtistCard
                  key={artist.id}
                  artist={artist}
                  isUserAuthenticated={true}
                  professionalProfileId={professionalProfile.id}
                  showProfessionalActions={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArtistsManagement;