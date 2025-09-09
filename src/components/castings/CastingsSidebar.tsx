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
    <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" collapsible="icon">
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm">Filtres de recherche</h2>
            </div>
          )}
          <SidebarTrigger className="h-8 w-8 bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-md transition-all duration-200 flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {!open ? (
          <div className="flex flex-col items-center space-y-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Filter className="h-5 w-5 text-muted-foreground" />
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
          </div>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent className="space-y-3">
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              )}

              {/* Recherche textuelle */}
              <div className="space-y-1.5">
                <Label htmlFor="search" className="text-xs font-medium">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Titre, description..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Lieu */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium">Lieu</Label>
                <Input
                  id="location"
                  placeholder="Ville, région..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>

              {/* Type de production */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type</Label>
                <Select 
                  value={filters.production_type || 'all'} 
                  onValueChange={(value) => handleFilterChange('production_type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous" />
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Voix</Label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {(filters.voice_types || []).map(voice => (
                    <Badge 
                      key={voice} 
                      variant="secondary"
                      className="text-xs h-5 px-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleArrayRemove('voice_types', voice)}
                    >
                      {voice.split(' ')[0]} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleArrayAdd('voice_types', value)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Ajouter" />
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Niveau</Label>
                <div className="flex flex-wrap gap-1 mb-1">
                  {(filters.experience_level || []).map(level => (
                    <Badge 
                      key={level} 
                      variant="secondary"
                      className="text-xs h-5 px-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleArrayRemove('experience_level', level)}
                    >
                      {experienceLevels.find(l => l.value === level)?.label || level} ×
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={(value) => handleArrayAdd('experience_level', value)}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Ajouter" />
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Compensation</Label>
                <Select 
                  value={filters.compensation_type || 'all'} 
                  onValueChange={(value) => handleFilterChange('compensation_type', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
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