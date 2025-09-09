import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, SlidersHorizontal, Calendar } from 'lucide-react';
import { EventCategory } from '@/hooks/useEvents';

interface EventsSidebarProps {
  filters: {
    event_type: string;
    category_id: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  categories: EventCategory[];
}

export const EventsSidebar: React.FC<EventsSidebarProps> = ({
  filters,
  onFiltersChange,
  categories,
}) => {
  const { open } = useSidebar();

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
            <Calendar className="h-6 w-6 text-lyrical-600" />
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
                  onClick={clearFilters}
                  className="w-full border-gold-300 text-gold-700 hover:bg-gold-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer tous les filtres
                </Button>
              )}

              {/* Recherche */}
              <div>
                <Label htmlFor="search" className="text-lyrical-800 dark:text-lyrical-200">Rechercher</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-lyrical-400" />
                  <Input
                    id="search"
                    placeholder="Titre, description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 border-gold-200/50 focus:border-lyrical-400"
                  />
                </div>
              </div>

              {/* Type d'événement */}
              <div>
                <Label className="text-lyrical-800 dark:text-lyrical-200">Type d'événement</Label>
                <Select
                  value={filters.event_type || 'all'}
                  onValueChange={(value) => handleFilterChange('event_type', value)}
                >
                  <SelectTrigger className="mt-1 border-gold-200/50 focus:border-lyrical-400">
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
              <div>
                <Label className="text-lyrical-800 dark:text-lyrical-200">Catégorie</Label>
                <Select
                  value={filters.category_id || 'all'}
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger className="mt-1 border-gold-200/50 focus:border-lyrical-400">
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
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};