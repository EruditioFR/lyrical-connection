
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useArtists } from '@/hooks/useArtists';
import { useAuth } from '@/hooks/useAuth';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';
import { ImageGenerationPanel } from '@/components/artists/ImageGenerationPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';

const ArtistsList = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [location, setLocation] = useState('');
  const [repertoireFilters, setRepertoireFilters] = useState<RepertoireFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Construire les filtres pour useArtists (seulement les filtres que le hook peut gérer)
  const apiFilters = {
    voiceType: voiceType || undefined,
    ...repertoireFilters
  };

  const { artists, isLoading, error } = useArtists(apiFilters);

  console.log('ArtistsList - Artists from hook:', artists);
  console.log('ArtistsList - Loading state:', isLoading);
  console.log('ArtistsList - Error state:', error);
  console.log('ArtistsList - API filters:', apiFilters);

  // Filtrer côté client pour les critères non gérés par l'API
  const filteredArtists = artists.filter(artist => {
    // Filtrer par terme de recherche
    const searchMatch = !searchTerm || 
      artist.stage_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.voice_type && artist.voice_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artist.location && artist.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtrer par localisation
    const locationMatch = !location || 
      (artist.location && artist.location.toLowerCase().includes(location.toLowerCase()));

    return searchMatch && locationMatch;
  });

  console.log('ArtistsList - Filtered artists:', filteredArtists);

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchTerm('');
    setVoiceType('');
    setLocation('');
    setRepertoireFilters({});
  };

  const handleImagesGenerated = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Chargement...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    console.error('Error loading artists:', error);
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-serif font-bold mb-4">Erreur</h1>
          <p className="text-muted-foreground">Impossible de charger la liste des artistes.</p>
          <p className="text-sm text-red-500 mt-2">{error?.message || 'Erreur inconnue'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* En-tête de la page */}
      <section className="bg-gradient-to-b from-muted to-background py-12 md:py-[30px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Nos Artistes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les talents qui composent notre communauté d'artistes lyriques.
            </p>
          </div>
          
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
        </div>
      </section>

      {/* Onglets pour utilisateurs connectés / Grille simple pour non-connectés */}
      {user ? (
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Tabs defaultValue="artists" className="w-full">
            <TabsContent value="artists" className="mt-6">
              <ArtistsGrid
                artists={artists}
                filteredArtists={filteredArtists}
                isLoading={isLoading}
                searchQuery={searchTerm}
                selectedVoiceTypes={voiceType ? [voiceType] : []}
                onResetFilters={resetFilters}
              />
            </TabsContent>
            <TabsContent value="generate-images" className="mt-6">
              <ImageGenerationPanel
                artists={artists}
                onImagesGenerated={handleImagesGenerated}
              />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="container mx-auto px-4 md:px-6 py-8">
          <ArtistsGrid
            artists={artists}
            filteredArtists={filteredArtists}
            isLoading={isLoading}
            searchQuery={searchTerm}
            selectedVoiceTypes={voiceType ? [voiceType] : []}
            onResetFilters={resetFilters}
          />
        </div>
      )}
    </Layout>
  );
};

export default ArtistsList;
