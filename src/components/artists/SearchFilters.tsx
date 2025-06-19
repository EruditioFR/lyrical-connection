
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from 'lucide-react';
import { voiceTypes } from '@/constants/voiceTypes';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  selectedVoiceTypes: string[];
  onVoiceTypeChange: (voiceType: string) => void;
  onResetFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  isFilterOpen,
  setIsFilterOpen,
  selectedVoiceTypes,
  onVoiceTypeChange,
  onResetFilters
}) => {
  return (
    <div className="container mx-auto px-4 md:px-6">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 text-center">
        Découvrez nos artistes lyriques
      </h1>
      <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-10">
        Explorez notre communauté de chanteurs lyriques talentueux. Filtrez par type de voix 
        ou localisation pour trouver l'artiste parfait pour votre projet.
      </p>

      {/* Barre de recherche */}
      <div className="relative max-w-2xl mx-auto mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-lyrical-200/20 to-gold-200/20 rounded-lg blur"></div>
        <div className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-1">
          <div className="flex items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un artiste par nom, type de voix, localisation..."
                className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              className="ml-2 flex items-center gap-2"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              Filtres
              {selectedVoiceTypes.length > 0 && (
                <span className="bg-lyrical-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedVoiceTypes.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres */}
      {isFilterOpen && (
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-md border border-border p-6 mb-8 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif font-semibold text-lg">Filtres avancés</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onResetFilters}
              className="text-sm"
            >
              Réinitialiser
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-3">Type de voix</h3>
            <div className="flex flex-wrap gap-2">
              {voiceTypes.map(voiceType => (
                <Button
                  key={voiceType}
                  variant={selectedVoiceTypes.includes(voiceType) ? "default" : "outline"}
                  size="sm"
                  className={selectedVoiceTypes.includes(voiceType) ? "bg-lyrical-600 hover:bg-lyrical-700" : ""}
                  onClick={() => onVoiceTypeChange(voiceType)}
                >
                  {voiceType}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
