
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter } from 'lucide-react';

interface FreeAccountsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  accountTypeFilter: string;
  onAccountTypeChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  hideAccountTypeFilter?: boolean;
}

const FreeAccountsFilters = ({
  searchTerm,
  onSearchChange,
  accountTypeFilter,
  onAccountTypeChange,
  dateFilter,
  onDateFilterChange,
  onClearFilters,
  activeFiltersCount,
  hideAccountTypeFilter = false
}: FreeAccountsFiltersProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {!hideAccountTypeFilter && (
          <Select value={accountTypeFilter} onValueChange={onAccountTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              <SelectItem value="artist">Artistes</SelectItem>
              <SelectItem value="professional">Professionnels</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
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
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Effacer les filtres
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>{activeFiltersCount} filtre(s) actif(s)</span>
        </div>
      )}
    </div>
  );
};

export default FreeAccountsFilters;
