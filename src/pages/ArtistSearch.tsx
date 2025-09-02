
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Download } from 'lucide-react';
import type { RepertoireFilters } from '@/components/artists/RepertoireFilters';
import type { SearchCriteria } from '@/types/search';

const ArtistSearch = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
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

  const { artists, isLoading } = useArtists({
    ...filters,
    isUserAuthenticated: true
  });
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

  const hasActiveFilters = searchTerm || voiceType || location || Object.values(repertoireFilters).some(Boolean);

  const handleSaveSearch = async () => {
    if (!hasActiveFilters) {
      toast({
        title: "Aucun critère de recherche",
        description: "Veuillez définir au moins un critère de recherche avant de sauvegarder.",
        variant: "destructive",
      });
      return;
    }

    const searchName = prompt('Nom de la recherche :');
    if (!searchName || searchName.trim() === '') {
      toast({
        title: "Nom requis",
        description: "Veuillez saisir un nom pour votre recherche.",
        variant: "destructive",
      });
      return;
    }

    try {
      const criteria: SearchCriteria = {
        searchTerm: searchTerm || undefined,
        voiceType: voiceType || undefined,
        location: location || undefined,
        repertoireFilters: Object.keys(repertoireFilters).length > 0 ? repertoireFilters : undefined,
      };

      console.log('Saving search with criteria:', criteria);

      await saveSearchMutation.mutateAsync({
        name: searchName.trim(),
        search_criteria: criteria as any,
      });

      toast({
        title: "Recherche sauvegardée",
        description: `La recherche "${searchName}" a été sauvegardée avec succès.`,
      });
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: "Impossible de sauvegarder la recherche. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const exportResults = () => {
    if (filteredArtists.length === 0) {
      toast({
        title: "Aucun résultat à exporter",
        description: "Il n'y a aucun artiste à exporter avec les critères actuels.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Nom d\'artiste', 'Type de voix', 'Localisation', 'Années d\'expérience', 'Email'],
      ...filteredArtists.map(artist => [
        artist.stage_name || 'Non spécifié',
        artist.voice_type || 'Non spécifié',
        artist.location || 'Non spécifiée',
        artist.experience_years?.toString() || '0',
        artist.contact_email || 'Non fourni'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recherche-artistes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export réussi",
      description: `${filteredArtists.length} artiste(s) exporté(s) avec succès.`,
    });
  };

  const handleLoadSearch = (criteria: SearchCriteria) => {
    console.log('Loading search criteria:', criteria);
    
    setSearchTerm(criteria.searchTerm || '');
    setVoiceType(criteria.voiceType || '');
    setLocation(criteria.location || '');
    setRepertoireFilters(criteria.repertoireFilters || {});
    setShowSavedSearches(false);

    toast({
      title: "Recherche chargée",
      description: "Les critères de recherche ont été appliqués.",
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setVoiceType('');
    setLocation('');
    setRepertoireFilters({});

    toast({
      title: "Filtres réinitialisés",
      description: "Tous les critères de recherche ont été effacés.",
    });
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
              disabled={saveSearchMutation.isPending || !hasActiveFilters}
              title={!hasActiveFilters ? "Définissez des critères de recherche pour sauvegarder" : "Sauvegarder cette recherche"}
            >
              {saveSearchMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
            <Button
              variant="outline"
              onClick={exportResults}
              disabled={filteredArtists.length === 0}
              title={filteredArtists.length === 0 ? "Aucun résultat à exporter" : `Exporter ${filteredArtists.length} artiste(s)`}
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

        {/* Indicateur de critères actifs */}
        {hasActiveFilters && (
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium">Critères actifs :</span>
            {searchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md">"{searchTerm}"</span>}
            {voiceType && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-md">{voiceType}</span>}
            {location && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-md">{location}</span>}
            {Object.values(repertoireFilters).some(Boolean) && <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 rounded-md">Répertoire</span>}
          </div>
        )}

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
