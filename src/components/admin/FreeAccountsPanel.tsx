
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { useFreeAccountsFilters } from '@/hooks/useFreeAccountsFilters';
import FreeAccountsStats from './FreeAccountsStats';
import FreeAccountsTable from './FreeAccountsTable';
import FreeAccountsFilters from './FreeAccountsFilters';
import CreateFreeAccountDialog from './CreateFreeAccountDialog';
import FreeAccountAnalytics from './FreeAccountAnalytics';

interface FreeAccountsPanelProps {
  accountType?: 'artist' | 'professional';
}

const FreeAccountsPanel = ({ accountType }: FreeAccountsPanelProps) => {
  const { allAccounts, isLoadingAllAccounts } = useAdminManagement();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const {
    searchTerm,
    setSearchTerm,
    accountTypeFilter,
    setAccountTypeFilter,
    dateFilter,
    setDateFilter,
    activeFiltersCount,
    clearFilters,
    applyFilters
  } = useFreeAccountsFilters();

  const handleAccountUpdated = () => {
    window.location.reload();
  };

  if (!allAccounts) {
    return <div>Chargement...</div>;
  }

  // Filter by account type if specified
  let accountsToFilter = [];
  if (accountType === 'artist') {
    accountsToFilter = allAccounts.artists.map(account => ({ ...account, type: 'artist' as const }));
  } else if (accountType === 'professional') {
    accountsToFilter = allAccounts.professionals.map(account => ({ ...account, type: 'professional' as const }));
  } else {
    accountsToFilter = [
      ...allAccounts.artists.map(account => ({ ...account, type: 'artist' as const })),
      ...allAccounts.professionals.map(account => ({ ...account, type: 'professional' as const }))
    ];
  }

  const filteredAccounts = applyFilters(accountsToFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {accountType === 'artist' && 'Gestion des Comptes Artistes'}
            {accountType === 'professional' && 'Gestion des Comptes Professionnels'}
            {!accountType && 'Gestion des Comptes'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {accountType === 'artist' && 'Gérez tous les comptes artistes (gratuits et payants)'}
            {accountType === 'professional' && 'Gérez tous les comptes professionnels (gratuits et payants)'}
            {!accountType && 'Gérez tous les comptes pour les artistes et professionnels'}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un compte
        </Button>
      </div>

      <FreeAccountsStats accountType={accountType} />
      
      <FreeAccountsFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        accountTypeFilter={accountTypeFilter}
        onAccountTypeChange={setAccountTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
        hideAccountTypeFilter={!!accountType}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Comptes {accountType === 'artist' ? 'artistes' : accountType === 'professional' ? 'professionnels' : ''} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FreeAccountsTable 
            filteredAccounts={filteredAccounts}
            accountType={accountType}
            onAccountUpdated={handleAccountUpdated}
          />
        </CardContent>
      </Card>

      <FreeAccountAnalytics accountType={accountType} />

      <CreateFreeAccountDialog 
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultAccountType={accountType}
      />
    </div>
  );
};

export default FreeAccountsPanel;
