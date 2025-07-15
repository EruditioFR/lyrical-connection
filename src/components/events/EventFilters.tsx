
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { EventCategory } from '@/hooks/useEvents';

interface EventFiltersProps {
  filters: {
    event_type: string;
    category_id: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: EventCategory[];
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const eventTypes = [
    { value: 'masterclass', label: 'Masterclass' },
    { value: 'stage', label: 'Stage' },
    { value: 'concours', label: 'Concours' },
    { value: 'atelier', label: 'Atelier' },
    { value: 'conference', label: 'Conférence' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" back to empty string for the filter logic
    const filterValue = value === 'all' ? '' : value;
    onFiltersChange({
      ...filters,
      [key]: filterValue,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      event_type: '',
      category_id: '',
      search: '',
    });
  };

  const hasActiveFilters = filters.event_type || filters.category_id || filters.search;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtres</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4" />
              Effacer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recherche */}
        <div className="space-y-2">
          <Label htmlFor="search">Rechercher</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Titre, description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type d'événement */}
        <div className="space-y-2">
          <Label>Type d'événement</Label>
          <Select
            value={filters.event_type || 'all'}
            onValueChange={(value) => handleFilterChange('event_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Catégorie */}
        <div className="space-y-2">
          <Label>Catégorie</Label>
          <Select
            value={filters.category_id || 'all'}
            onValueChange={(value) => handleFilterChange('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
