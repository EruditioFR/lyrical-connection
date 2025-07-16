
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
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
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fonction pour rafraîchir les données après modification
  const handleAccountUpdated = () => {
    // Les données seront automatiquement rafraîchies grâce à React Query
    window.location.reload();
  };

  // Calculate active filters count
  const activeFiltersCount = [
    searchTerm,
    accountTypeFilter !== 'all' ? accountTypeFilter : '',
    dateFilter !== 'all' ? dateFilter : ''
  ].filter(Boolean).length;

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setAccountTypeFilter('all');
    setDateFilter('all');
  };

  const applyFilters = (accounts: any[]) => {
    let filtered = [...accounts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.stage_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply account type filter
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === accountTypeFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(account => {
        const createdAt = new Date(account.created_at);
        
        switch (dateFilter) {
          case 'today':
            return createdAt.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return createdAt >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return createdAt >= monthAgo;
          case 'older':
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return createdAt <= thirtyDaysAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  if (!allAccounts) {
    return <div>Chargement...</div>;
  }

  // Filtrer par type de compte si spécifié
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
