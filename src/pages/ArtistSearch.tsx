
import React, { useState } from 'react';
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
      ...artists.map(artist => [
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
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
              disabled={artists.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Panneau des recherches sauvegardées */}
          {showSavedSearches && (
            <div className="lg:col-span-1">
              <SavedSearchesPanel onLoadSearch={handleLoadSearch} />
            </div>
          )}

          {/* Filtres */}
          <div className={showSavedSearches ? "lg:col-span-1" : "lg:col-span-1"}>
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
          <div className={showSavedSearches ? "lg:col-span-2" : "lg:col-span-3"}>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-lyrical-600" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  {artists.length} artiste{artists.length !== 1 ? 's' : ''} trouvé{artists.length !== 1 ? 's' : ''}
                </div>
                
                <ArtistsGrid artists={artists} />
                
                {artists.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Aucun artiste ne correspond à vos critères.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Essayez de modifier vos filtres de recherche.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistSearch;
