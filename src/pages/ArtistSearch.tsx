
import React, { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';
import SavedSearchesPanel from '@/components/artists/SavedSearchesPanel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useSaveSearch } from '@/hooks/useSavedSearches';
import { Loader2, Save, Download } from 'lucide-react';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';
import type { SearchCriteria } from '@/types/search';

const ArtistSearch = () => {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceType, setVoiceType] = useState('');
  const [location, setLocation] = useState('');
  const [repertoireFilters, setRepertoireFilters] = useState<RepertoireFilters>({});
  const [showSavedSearches, setShowSavedSearches] = useState(false);

  const filters = {
    searchTerm,
    voiceType: voiceType || undefined,
    location: location || undefined,
    repertoire: repertoireFilters,
  };

  const { artists, isLoading } = useArtists(filters);
  const saveSearchMutation = useSaveSearch();

  // Filter artists based on current criteria
  const filteredArtists = useMemo(() => {
    return artists.filter(artist => {
      // Additional client-side filtering if needed
      return true;
    });
  }, [artists]);

  // Get selected voice types for display
  const selectedVoiceTypes = useMemo(() => {
    return voiceType ? [voiceType] : [];
  }, [voiceType]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSaveSearch = async () => {
    const searchName = prompt('Nom de la recherche :');
    if (!searchName) return;

    const criteria: SearchCriteria = {
      searchTerm,
      voiceType,
      location,
      repertoireFilters,
    };

    await saveSearchMutation.mutateAsync({
      name: searchName,
      search_criteria: criteria as any,
    });
  };

  const exportResults = () => {
    const csvContent = [
      ['Nom d\'artiste', 'Type de voix', 'Localisation', 'Années d\'expérience', 'Email'],
      ...filteredArtists.map(artist => [
        artist.stage_name,
        artist.voice_type || 'Non spécifié',
        artist.location || 'Non spécifiée',
        artist.experience_years?.toString() || '0',
        artist.contact_email || 'Non fourni'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recherche-artistes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLoadSearch = (criteria: SearchCriteria) => {
    setSearchTerm(criteria.searchTerm || '');
    setVoiceType(criteria.voiceType || '');
    setLocation(criteria.location || '');
    setRepertoireFilters(criteria.repertoireFilters || {});
    setShowSavedSearches(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setVoiceType('');
    setLocation('');
    setRepertoireFilters({});
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recherche d'artistes</h1>
            <p className="text-gray-600 mt-2">
              Trouvez les artistes parfaits pour vos productions
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowSavedSearches(!showSavedSearches)}
            >
              Recherches sauvegardées
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveSearch}
              disabled={saveSearchMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button
              variant="outline"
              onClick={exportResults}
              disabled={filteredArtists.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Panneau des recherches sauvegardées (collapsible) */}
        {showSavedSearches && (
          <div className="mb-8">
            <SavedSearchesPanel onLoadSearch={handleLoadSearch} />
          </div>
        )}

        {/* Filtres de recherche */}
        <div className="mb-8">
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

        {/* Résultats */}
        <ArtistsGrid 
          artists={artists}
          filteredArtists={filteredArtists}
          isLoading={isLoading}
          searchQuery={searchTerm}
          selectedVoiceTypes={selectedVoiceTypes}
          onResetFilters={handleResetFilters}
        />
      </div>
    </Layout>
  );
};

export default ArtistSearch;
