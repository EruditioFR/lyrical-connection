
import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import SearchFilters from '@/components/artists/SearchFilters';
import ArtistsGrid from '@/components/artists/ArtistsGrid';
import SavedSearchesPanel from '@/components/artists/SavedSearchesPanel';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useArtists } from '@/hooks/useArtists';
import { useUnavailableArtistIds } from '@/hooks/useArtistAvailability';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const availabilityTo = availableTo || availableFrom;
  const { unavailableIds, featureUnavailable } = useUnavailableArtistIds(availableFrom || undefined, availabilityTo || undefined);
  const toggleCompare = (id: string) =>
    setCompareIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : ids.length < 4 ? [...ids, id] : ids);

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
  // Disponibilité : exclure les artistes ayant un engagement ou une indisponibilité sur la période
  const filteredArtists = useMemo(() => {
    if (!unavailableIds) return artists;
    return artists.filter(artist => !unavailableIds.has(artist.id));
  }, [artists, unavailableIds]);

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
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recherche d'artistes</h1>
            <p className="text-muted-foreground mt-2">
              Trouvez les artistes parfaits pour vos productions
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
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

        {/* Disponibilité */}
        <fieldset className="mb-8 flex flex-wrap items-end gap-4 rounded-lg border p-4">
          <legend className="px-1 text-sm font-medium">Disponible</legend>
          <div>
            <Label htmlFor="available-from">Du</Label>
            <Input id="available-from" type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="available-to">Au</Label>
            <Input id="available-to" type="date" min={availableFrom || undefined} value={availableTo} onChange={e => setAvailableTo(e.target.value)} />
          </div>
          {(availableFrom || availableTo) && (
            <Button variant="ghost" onClick={() => { setAvailableFrom(''); setAvailableTo(''); }}>Effacer les dates</Button>
          )}
          <p className="basis-full text-sm text-muted-foreground">
            {featureUnavailable
              ? 'Le filtre de disponibilité sera actif après la mise à jour de la base de données.'
              : unavailableIds
                ? `${unavailableIds.size} artiste(s) indisponible(s) sur cette période, masqué(s) des résultats.`
                : "D'après l'agenda déclaré par chaque artiste."}
          </p>
        </fieldset>

        {/* Indicateur de critères actifs */}
        {hasActiveFilters && (
          <div className="mb-4 text-sm text-muted-foreground">
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
          compareIds={compareIds}
          onToggleCompare={toggleCompare}
        />

        {/* Barre du comparateur */}
        {compareIds.length > 0 && (
          <div className="sticky bottom-4 z-20 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-lg">
            <p className="text-sm">
              {compareIds.length} artiste(s) sélectionné(s) — jusqu'à 4
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setCompareIds([])}>Effacer</Button>
              <Button asChild disabled={compareIds.length < 2}>
                <Link to={`/comparer?ids=${compareIds.join(',')}`} aria-disabled={compareIds.length < 2}
                  onClick={e => { if (compareIds.length < 2) e.preventDefault(); }}>
                  Comparer
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ArtistSearch;
