
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface CastingFiltersProps {
  filters: {
    search?: string;
    location?: string;
    production_type?: string;
    voice_types?: string[];
    experience_level?: string[];
    compensation_type?: string;
  };
  onFiltersChange: (filters: any) => void;
}

const productionTypes = [
  { value: 'opera', label: 'Opéra' },
  { value: 'operetta', label: 'Opérette' },
  { value: 'concert', label: 'Concert' },
  { value: 'competition', label: 'Concours' },
  { value: 'masterclass', label: 'Masterclass' },
  { value: 'other', label: 'Autre' },
];

const voiceTypes = [
  'Soprano colorature', 'Soprano lyrique', 'Soprano dramatique',
  'Mezzo-soprano', 'Alto', 'Contralto',
  'Ténor léger', 'Ténor lyrique', 'Ténor dramatique',
  'Baryton', 'Basse-baryton', 'Basse'
];

const experienceLevels = [
  { value: 'beginner', label: 'Débutant' },
  { value: 'intermediate', label: 'Intermédiaire' },
  { value: 'advanced', label: 'Avancé' },
  { value: 'professional', label: 'Professionnel' },
];

const compensationTypes = [
  { value: 'paid', label: 'Rémunéré' },
  { value: 'unpaid', label: 'Non rémunéré' },
  { value: 'travel_covered', label: 'Transport couvert' },
  { value: 'accommodation_covered', label: 'Hébergement couvert' },
];

const CastingFilters: React.FC<CastingFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleArrayAdd = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters] as string[] || [];
    if (!current.includes(value)) {
      handleFilterChange(key, [...current, value]);
    }
  };

  const handleArrayRemove = (key: string, value: string) => {
    const current = filters[key as keyof typeof filters] as string[] || [];
    handleFilterChange(key, current.filter(item => item !== value));
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres de recherche
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche textuelle */}
        <div>
          <Label htmlFor="search">Recherche</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Titre, description..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lieu */}
        <div>
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            placeholder="Ville, région..."
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          />
        </div>

        {/* Type de production */}
        <div>
          <Label>Type de production</Label>
          <Select 
            value={filters.production_type || ''} 
            onValueChange={(value) => handleFilterChange('production_type', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {productionTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Types de voix */}
        <div>
          <Label>Types de voix</Label>
          <div className="flex flex-wrap gap-1 mt-2 mb-2">
            {(filters.voice_types || []).map(voice => (
              <Badge 
                key={voice} 
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => handleArrayRemove('voice_types', voice)}
              >
                {voice} ×
              </Badge>
            ))}
          </div>
          <Select onValueChange={(value) => handleArrayAdd('voice_types', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ajouter un type de voix" />
            </SelectTrigger>
            <SelectContent>
              {voiceTypes.map(voice => (
                <SelectItem key={voice} value={voice}>
                  {voice}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Niveau d'expérience */}
        <div>
          <Label>Niveau d'expérience</Label>
          <div className="flex flex-wrap gap-1 mt-2 mb-2">
            {(filters.experience_level || []).map(level => (
              <Badge 
                key={level} 
                variant="secondary"
                className="cursor-pointer text-xs"
                onClick={() => handleArrayRemove('experience_level', level)}
              >
                {experienceLevels.find(l => l.value === level)?.label || level} ×
              </Badge>
            ))}
          </div>
          <Select onValueChange={(value) => handleArrayAdd('experience_level', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Ajouter un niveau" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type de compensation */}
        <div>
          <Label>Compensation</Label>
          <Select 
            value={filters.compensation_type || ''} 
            onValueChange={(value) => handleFilterChange('compensation_type', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {compensationTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CastingFilters;
