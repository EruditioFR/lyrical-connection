
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar } from 'lucide-react';

interface FreeAccountsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  accountTypeFilter: string;
  onAccountTypeChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const FreeAccountsFilters = ({
  searchTerm,
  onSearchChange,
  accountTypeFilter,
  onAccountTypeChange,
  dateFilter,
  onDateFilterChange,
  onClearFilters,
  activeFiltersCount
}: FreeAccountsFiltersProps) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={accountTypeFilter} onValueChange={onAccountTypeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type de compte" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les comptes</SelectItem>
            <SelectItem value="artist">Artistes</SelectItem>
            <SelectItem value="professional">Professionnels</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Créé depuis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les dates</SelectItem>
            <SelectItem value="today">Aujourd'hui</SelectItem>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="older">Plus de 30 jours</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Effacer ({activeFiltersCount})
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filtres actifs :</span>
          {searchTerm && (
            <Badge variant="secondary" className="gap-1">
              Recherche: "{searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {accountTypeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {accountTypeFilter === 'artist' ? 'Artistes' : 'Professionnels'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onAccountTypeChange('all')}
              />
            </Badge>
          )}
          {dateFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {dateFilter}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onDateFilterChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FreeAccountsFilters;
