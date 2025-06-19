
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useArtists } from '@/hooks/useArtists';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';

const ArtistsList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedVoiceTypes, setSelectedVoiceTypes] = useState<string[]>([]);
  
  const { artists, isLoading, error } = useArtists();

  console.log('ArtistsList - Artists from hook:', artists);
  console.log('ArtistsList - Loading state:', isLoading);
  console.log('ArtistsList - Error state:', error);

  // Fonction pour filtrer les artistes
  const filteredArtists = artists.filter(artist => {
    // Filtrer par terme de recherche
    const searchMatch = artist.stage_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (artist.voice_type && artist.voice_type.toLowerCase().includes(searchQuery.toLowerCase())) ||
                       (artist.location && artist.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
                       (artist.bio && artist.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filtrer par type de voix
    const voiceTypeMatch = selectedVoiceTypes.length === 0 || 
                          (artist.voice_type && selectedVoiceTypes.includes(artist.voice_type));
    
    return searchMatch && voiceTypeMatch;
  });

  console.log('ArtistsList - Filtered artists:', filteredArtists);

  // Gérer les changements de type de voix
  const handleVoiceTypeChange = (voiceType: string) => {
    setSelectedVoiceTypes(prev => 
      prev.includes(voiceType) 
        ? prev.filter(v => v !== voiceType) 
        : [...prev, voiceType]
    );
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedVoiceTypes([]);
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
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          selectedVoiceTypes={selectedVoiceTypes}
          onVoiceTypeChange={handleVoiceTypeChange}
          onResetFilters={resetFilters}
        />
      </section>

      {/* Liste des artistes */}
      <ArtistsGrid
        artists={artists}
        filteredArtists={filteredArtists}
        isLoading={isLoading}
        searchQuery={searchQuery}
        selectedVoiceTypes={selectedVoiceTypes}
        onResetFilters={resetFilters}
      />
    </Layout>
  );
};

export default ArtistsList;
