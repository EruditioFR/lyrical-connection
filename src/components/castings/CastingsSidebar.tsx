import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CastingsSidebarProps {
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

export const CastingsSidebar: React.FC<CastingsSidebarProps> = ({ filters, onFiltersChange }) => {
  const { open } = useSidebar();

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
    <Sidebar className={`border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 ${!open ? "w-16" : "w-80"}`} collapsible="icon">
      <SidebarHeader className="p-4 border-b border-gold-200/20">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-lyrical-600" />
              <h2 className="font-semibold text-lyrical-800 dark:text-lyrical-200">Filtres de recherche</h2>
            </div>
          )}
          <SidebarTrigger className="text-lyrical-600 hover:text-lyrical-800">
            <SlidersHorizontal className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        {!open ? (
          <div className="flex flex-col items-center space-y-4">
            <Search className="h-6 w-6 text-lyrical-600" />
            <Filter className="h-6 w-6 text-lyrical-600" />
            {hasActiveFilters && (
              <div className="w-3 h-3 bg-lyrical-600 rounded-full"></div>
            )}
          </div>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent className="space-y-4">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full border-gold-300 text-gold-700 hover:bg-gold-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer tous les filtres
                </Button>
              )}

              {/* Recherche textuelle */}
              <div>
                <Label htmlFor="search" className="text-lyrical-800 dark:text-lyrical-200">Recherche</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-lyrical-400" />
                  <Input
                    id="search"
                    placeholder="Titre, description..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 border-gold-200/50 focus:border-lyrical-400"
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <Label htmlFor="location" className="text-lyrical-800 dark:text-lyrical-200">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Ville, région..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="mt-1 border-gold-200/50 focus:border-lyrical-400"
                />
              </div>

              {/* Type de production */}
              <div>
                <Label className="text-lyrical-800 dark:text-lyrical-200">Type de production</Label>
                <Select 
                  value={filters.production_type || 'all'} 
                  onValueChange={(value) => handleFilterChange('production_type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="mt-1 border-gold-200/50 focus:border-lyrical-400">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
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
                <Label className="text-lyrical-800 dark:text-lyrical-200">Types de voix</Label>
                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {(filters.voice_types || []).map(voice => (
                    <Badge 
                      key={voice} 
                      variant="secondary"
                      className="cursor-pointer text-xs bg-lyrical-100 text-lyrical-800 hover:bg-lyrical-200"
                      onClick={() => handleArrayRemove('voice_types', voice)}
                    >
                      {voice} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleArrayAdd('voice_types', value)}>
                  <SelectTrigger className="border-gold-200/50 focus:border-lyrical-400">
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
                <Label className="text-lyrical-800 dark:text-lyrical-200">Niveau d'expérience</Label>
                <div className="flex flex-wrap gap-1 mt-2 mb-2">
                  {(filters.experience_level || []).map(level => (
                    <Badge 
                      key={level} 
                      variant="secondary"
                      className="cursor-pointer text-xs bg-lyrical-100 text-lyrical-800 hover:bg-lyrical-200"
                      onClick={() => handleArrayRemove('experience_level', level)}
                    >
                      {experienceLevels.find(l => l.value === level)?.label || level} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleArrayAdd('experience_level', value)}>
                  <SelectTrigger className="border-gold-200/50 focus:border-lyrical-400">
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
                <Label className="text-lyrical-800 dark:text-lyrical-200">Compensation</Label>
                <Select 
                  value={filters.compensation_type || 'all'} 
                  onValueChange={(value) => handleFilterChange('compensation_type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="mt-1 border-gold-200/50 focus:border-lyrical-400">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {compensationTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};