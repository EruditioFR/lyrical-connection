
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X } from 'lucide-react';
import RepertoireFilters, { type RepertoireFilters as RepertoireFiltersType } from './RepertoireFilters';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  voiceType: string;
  onVoiceTypeChange: (type: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  repertoireFilters: RepertoireFiltersType;
  onRepertoireFiltersChange: (filters: RepertoireFiltersType) => void;
}

const voiceTypes = [
  'Soprano',
  'Mezzo-soprano', 
  'Alto',
  'Ténor',
  'Baryton',
  'Basse'
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  voiceType,
  onVoiceTypeChange,
  location,
  onLocationChange,
  repertoireFilters,
  onRepertoireFiltersChange,
}) => {
  const [showRepertoireFilters, setShowRepertoireFilters] = useState(false);

  const clearAllFilters = () => {
    onSearchChange('');
    onVoiceTypeChange('');
    onLocationChange('');
    onRepertoireFiltersChange({});
  };

  const hasActiveFilters = searchTerm || voiceType || location || Object.values(repertoireFilters).some(Boolean);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Recherche générale */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher par nom d'artiste..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={voiceType} onValueChange={onVoiceTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de voix" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les types</SelectItem>
                  {voiceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Localisation"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
              />

              <div className="flex gap-2">
                <Button
                  variant={showRepertoireFilters ? "default" : "outline"}
                  onClick={() => setShowRepertoireFilters(!showRepertoireFilters)}
                  className="flex-1"
                >
                  Filtrer par répertoire
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearAllFilters}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres de répertoire */}
      {showRepertoireFilters && (
        <RepertoireFilters
          filters={repertoireFilters}
          onFiltersChange={onRepertoireFiltersChange}
        />
      )}
    </div>
  );
};

export default SearchFilters;
