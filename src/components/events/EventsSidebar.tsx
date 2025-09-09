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
    <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" collapsible="icon">
      <SidebarHeader className="p-3 border-b">
        <div className="flex items-center justify-between">
          {open && (
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-medium text-sm">Filtres</h2>
            </div>
          )}
          <SidebarTrigger className="h-6 w-6 text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="h-4 w-4" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {!open ? (
          <div className="flex flex-col items-center space-y-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Calendar className="h-5 w-5 text-muted-foreground" />
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
                  onClick={clearFilters}
                  className="w-full h-8 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Effacer
                </Button>
              )}

              {/* Recherche */}
              <div className="space-y-1.5">
                <Label htmlFor="search" className="text-xs font-medium">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Titre, description..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>

              {/* Type d'événement */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Type</Label>
                <Select
                  value={filters.event_type || 'all'}
                  onValueChange={(value) => handleFilterChange('event_type', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tous" />
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
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Catégorie</Label>
                <Select
                  value={filters.category_id || 'all'}
                  onValueChange={(value) => handleFilterChange('category_id', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Toutes" />
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