import React from 'react';
import { Search, MapPin, Calendar, Music, User, Award, DollarSign, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CastingsFilterSidebarProps {
  filters: {
    search?: string;
    location?: string;
    production_type?: string;
    voice_types?: string[];
    experience_level?: string[];
    compensation_type?: string;
    date_range?: string;
  };
  onFiltersChange: (filters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const productionTypes = [
  { value: 'opera', label: 'Opéra', icon: Music },
  { value: 'operetta', label: 'Opérette', icon: Music },
  { value: 'concert', label: 'Concert', icon: Music },
  { value: 'competition', label: 'Concours', icon: Award },
  { value: 'masterclass', label: 'Masterclass', icon: User },
  { value: 'other', label: 'Autre', icon: Filter },
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
  { value: 'paid', label: 'Rémunéré', icon: DollarSign },
  { value: 'unpaid', label: 'Non rémunéré', icon: X },
  { value: 'travel_covered', label: 'Transport couvert', icon: MapPin },
  { value: 'accommodation_covered', label: 'Hébergement couvert', icon: MapPin },
];

const dateRanges = [
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: '3months', label: '3 prochains mois' },
  { value: '6months', label: '6 prochains mois' },
  { value: 'year', label: 'Cette année' },
];

export const CastingsFilterSidebar: React.FC<CastingsFilterSidebarProps> = ({ 
  filters, 
  onFiltersChange, 
  isOpen, 
  onToggle 
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value
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

  const activeFiltersCount = Object.values(filters).filter(value => 
    value && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  if (!isOpen) {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
        <Button
          onClick={onToggle}
          variant="outline"
          size="sm"
          className="bg-background/95 backdrop-blur-sm border shadow-lg hover:bg-muted/50 transition-all duration-200 rounded-full p-3"
        >
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onToggle}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-xl z-50 overflow-y-auto">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-4 border-b bg-gradient-to-r from-lyrical-50 to-gold-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5 text-lyrical-600" />
                Recherche & Filtres
              </CardTitle>
              <Button
                onClick={onToggle}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {activeFiltersCount > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs hover:text-destructive"
                >
                  Tout effacer
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4 space-y-6">
            {/* Recherche textuelle */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4 text-lyrical-600" />
                Recherche
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Titre, description, lieu..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
                />
              </div>
            </div>

            <Separator />

            {/* Lieu */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-lyrical-600" />
                Lieu
              </Label>
              <Input
                placeholder="Ville, région, pays..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background"
              />
            </div>

            <Separator />

            {/* Type de production */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Music className="h-4 w-4 text-lyrical-600" />
                Type de production
              </Label>
              <Select 
                value={filters.production_type || 'all'} 
                onValueChange={(value) => handleFilterChange('production_type', value)}
              >
                <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {productionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Types de voix */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Types de voix recherchés</Label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[32px] p-2 bg-muted/30 rounded-md border border-muted-foreground/20">
                {(filters.voice_types || []).length === 0 ? (
                  <span className="text-muted-foreground text-sm">Aucune sélection</span>
                ) : (
                  (filters.voice_types || []).map(voice => (
                    <Badge 
                      key={voice} 
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => handleArrayRemove('voice_types', voice)}
                    >
                      {voice.split(' ')[0]} ×
                    </Badge>
                  ))
                )}
              </div>
              <Select onValueChange={(value) => handleArrayAdd('voice_types', value)}>
                <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20">
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

            <Separator />

            {/* Niveau d'expérience */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-lyrical-600" />
                Niveau d'expérience
              </Label>
              <div className="flex flex-wrap gap-1 mb-2 min-h-[32px] p-2 bg-muted/30 rounded-md border border-muted-foreground/20">
                {(filters.experience_level || []).length === 0 ? (
                  <span className="text-muted-foreground text-sm">Tous niveaux</span>
                ) : (
                  (filters.experience_level || []).map(level => (
                    <Badge 
                      key={level} 
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => handleArrayRemove('experience_level', level)}
                    >
                      {experienceLevels.find(l => l.value === level)?.label || level} ×
                    </Badge>
                  ))
                )}
              </div>
              <Select onValueChange={(value) => handleArrayAdd('experience_level', value)}>
                <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20">
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

            <Separator />

            {/* Type de compensation */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-lyrical-600" />
                Compensation
              </Label>
              <Select 
                value={filters.compensation_type || 'all'} 
                onValueChange={(value) => handleFilterChange('compensation_type', value)}
              >
                <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20">
                  <SelectValue placeholder="Tous types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  {compensationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Période */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-lyrical-600" />
                Période d'audition
              </Label>
              <Select 
                value={filters.date_range || 'all'} 
                onValueChange={(value) => handleFilterChange('date_range', value)}
              >
                <SelectTrigger className="h-10 bg-muted/30 border-muted-foreground/20">
                  <SelectValue placeholder="Toutes périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes périodes</SelectItem>
                  {dateRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};