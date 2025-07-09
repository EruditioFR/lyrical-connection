
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Search, Filter } from 'lucide-react';
import { useLyricalWorks } from '@/hooks/useLyricalWorks';

export interface RepertoireFilters {
  workId?: string;
  composer?: string;
  category?: string;
  period?: string;
  voiceType?: string;
  masteryLevel?: string;
}

interface RepertoireFiltersProps {
  filters: RepertoireFilters;
  onFiltersChange: (filters: RepertoireFilters) => void;
}

const categories = [
  { value: 'opera', label: 'Opéra' },
  { value: 'oratorio', label: 'Oratorio' },
  { value: 'song', label: 'Mélodie' },
  { value: 'operetta', label: 'Opérette' },
];

const periods = [
  { value: 'baroque', label: 'Baroque' },
  { value: 'classical', label: 'Classique' },
  { value: 'romantic', label: 'Romantique' },
  { value: 'modern', label: 'Moderne' },
  { value: 'contemporary', label: 'Contemporain' },
];

const voiceTypes = [
  { value: 'Soprano', label: 'Soprano' },
  { value: 'Mezzo-soprano', label: 'Mezzo-soprano' },
  { value: 'Alto', label: 'Alto' },
  { value: 'Ténor', label: 'Ténor' },
  { value: 'Baryton', label: 'Baryton' },
  { value: 'Basse', label: 'Basse' },
];

const masteryLevels = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'expert', label: 'Expert' },
];

const RepertoireFilters: React.FC<RepertoireFiltersProps> = ({ filters, onFiltersChange }) => {
  const [workSearch, setWorkSearch] = useState('');
  const [composerSearch, setComposerSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const { works } = useLyricalWorks(workSearch);

  const handleFilterChange = (key: keyof RepertoireFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setWorkSearch('');
    setComposerSearch('');
  };

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrer par répertoire
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? 'Masquer' : 'Filtres avancés'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche par œuvre */}
        <div className="space-y-2">
          <Label htmlFor="work-search">Rechercher une œuvre spécifique</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="work-search"
              placeholder="Tapez le titre d'une œuvre..."
              value={workSearch}
              onChange={(e) => setWorkSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          {works.length > 0 && workSearch.length > 1 && (
            <div className="border rounded-md max-h-40 overflow-y-auto">
              {works.map((work) => (
                <div
                  key={work.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    filters.workId === work.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => {
                    handleFilterChange('workId', work.id);
                    setWorkSearch(work.title);
                  }}
                >
                  <div className="font-medium">{work.title}</div>
                  <div className="text-sm text-gray-600">{work.composer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recherche par compositeur */}
        <div className="space-y-2">
          <Label htmlFor="composer-search">Compositeur</Label>
          <Input
            id="composer-search"
            placeholder="Mozart, Verdi, Puccini..."
            value={composerSearch}
            onChange={(e) => {
              setComposerSearch(e.target.value);
              handleFilterChange('composer', e.target.value);
            }}
          />
        </div>

        {/* Filtres avancés */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Période</Label>
                <Select
                  value={filters.period || ''}
                  onValueChange={(value) => handleFilterChange('period', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les périodes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les périodes</SelectItem>
                    {periods.map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type de voix</Label>
                <Select
                  value={filters.voiceType || ''}
                  onValueChange={(value) => handleFilterChange('voiceType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les types de voix" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types de voix</SelectItem>
                    {voiceTypes.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Niveau de maîtrise minimum</Label>
                <Select
                  value={filters.masteryLevel || ''}
                  onValueChange={(value) => handleFilterChange('masteryLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les niveaux</SelectItem>
                    {masteryLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {filters.workId && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Œuvre sélectionnée
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange('workId', undefined);
                    setWorkSearch('');
                  }}
                />
              </Badge>
            )}
            {filters.composer && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.composer}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => {
                    handleFilterChange('composer', undefined);
                    setComposerSearch('');
                  }}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {categories.find(c => c.value === filters.category)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange('category', undefined)}
                />
              </Badge>
            )}
            {filters.period && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {periods.find(p => p.value === filters.period)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange('period', undefined)}
                />
              </Badge>
            )}
            {filters.voiceType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.voiceType}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange('voiceType', undefined)}
                />
              </Badge>
            )}
            {filters.masteryLevel && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {masteryLevels.find(m => m.value === filters.masteryLevel)?.label}+
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange('masteryLevel', undefined)}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-800"
            >
              Effacer tous les filtres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RepertoireFilters;
