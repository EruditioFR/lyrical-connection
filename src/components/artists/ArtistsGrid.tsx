
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';
import ArtistCard from './ArtistCard';

interface ArtistsGridProps {
  artists: any[];
  filteredArtists: any[];
  isLoading: boolean;
  searchQuery: string;
  selectedVoiceTypes: string[];
  onResetFilters: () => void;
}

const ArtistsGrid: React.FC<ArtistsGridProps> = ({
  artists,
  filteredArtists,
  isLoading,
  searchQuery,
  selectedVoiceTypes,
  onResetFilters
}) => {
  console.log('ArtistsGrid - Rendering with:', {
    artists: artists.length,
    filteredArtists: filteredArtists.length,
    isLoading,
    searchQuery,
    selectedVoiceTypes
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 md:px-6">
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement des artistes...</span>
          </div>
        )}

        {/* Contenu principal - seulement quand pas en chargement */}
        {!isLoading && (
          <>
            {/* Résultats de recherche */}
            <div className="mb-8 flex justify-between items-center">
              <p className="text-muted-foreground">
                {filteredArtists.length} {filteredArtists.length === 1 ? 'artiste trouvé' : 'artistes trouvés'}
              </p>
              {artists.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Total en base: {artists.length} artiste{artists.length === 1 ? '' : 's'}
                </p>
              )}
            </div>

            {/* Grille d'artistes ou message d'absence */}
            {filteredArtists.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-serif font-semibold mb-2">Aucun artiste trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  {artists.length === 0 
                    ? "Aucun artiste n'est encore inscrit sur la plateforme."
                    : "Essayez de modifier vos critères de recherche ou de réinitialiser les filtres."
                  }
                </p>
                {(selectedVoiceTypes.length > 0 || searchQuery.trim() !== '') && (
                  <Button onClick={onResetFilters}>Réinitialiser les filtres</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredArtists.map((artist, index) => {
                  console.log('Rendering artist card for:', artist.stage_name, 'at index:', index);
                  return (
                    <div 
                      key={artist.id}
                      className="text-appear"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ArtistCard artist={artist} />
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default ArtistsGrid;
