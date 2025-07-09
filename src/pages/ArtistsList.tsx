
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useArtists } from '@/hooks/useArtists';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';

const ArtistsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [location, setLocation] = useState('');
  const [repertoireFilters, setRepertoireFilters] = useState<RepertoireFilters>({});
  
  // Construire les filtres pour useArtists
  const combinedFilters = {
    voiceType: voiceType || undefined,
    ...repertoireFilters,
  };
  
  const { artists, isLoading, error } = useArtists(combinedFilters);

  console.log('ArtistsList - Artists from hook:', artists);
  console.log('ArtistsList - Loading state:', isLoading);
  console.log('ArtistsList - Error state:', error);
  console.log('ArtistsList - Combined filters:', combinedFilters);

  // Fonction pour filtrer les artistes côté client
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
      <section className="bg-gradient-to-b from-muted to-background py-12 md:py-20">
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

      {/* Liste des artistes */}
      <ArtistsGrid
        artists={artists}
        filteredArtists={filteredArtists}
        isLoading={isLoading}
        searchQuery={searchTerm}
        selectedVoiceTypes={voiceType ? [voiceType] : []}
        onResetFilters={resetFilters}
      />
    </Layout>
  );
};

export default ArtistsList;
