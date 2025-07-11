
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import CreateFreeAccountDialog from './CreateFreeAccountDialog';
import FreeAccountsStats from './FreeAccountsStats';
import FreeAccountsFilters from './FreeAccountsFilters';
import FreeAccountsTable from './FreeAccountsTable';

const FreeAccountsPanel = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  const { freeAccounts, isLoadingFreeAccounts } = useAdminManagement();

  // Transform data for the table
  const allAccounts = useMemo(() => {
    const accounts = [];
    
    // Add artists
    if (freeAccounts?.artists) {
      accounts.push(...freeAccounts.artists.map(artist => ({
        id: artist.id,
        user_id: artist.user_id,
        stage_name: artist.stage_name,
        contact_email: artist.contact_email,
        created_at: artist.created_at,
        type: 'artist' as const
      })));
    }
    
    // Add professionals
    if (freeAccounts?.professionals) {
      accounts.push(...freeAccounts.professionals.map(professional => ({
        id: professional.id,
        user_id: professional.user_id,
        company_name: professional.company_name,
        contact_email: professional.contact_email,
        created_at: professional.created_at,
        type: 'professional' as const
      })));
    }
    
    return accounts;
  }, [freeAccounts]);

  // Filter accounts based on search and filters
  const filteredAccounts = useMemo(() => {
    let filtered = allAccounts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(account => {
        const name = account.stage_name || account.company_name || '';
        const email = account.contact_email || '';
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Account type filter
    if (accountTypeFilter !== 'all') {
      filtered = filtered.filter(account => account.type === accountTypeFilter);
    }

    // Date filter
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
  }, [allAccounts, searchTerm, accountTypeFilter, dateFilter]);

  const activeFiltersCount = [searchTerm, accountTypeFilter !== 'all', dateFilter !== 'all']
    .filter(Boolean).length;

  const handleClearFilters = () => {
    setSearchTerm('');
    setAccountTypeFilter('all');
    setDateFilter('all');
  };

  if (isLoadingFreeAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Comptes gratuits</h2>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comptes gratuits</h2>
          <p className="text-muted-foreground">
            Gérez les comptes gratuits créés par les administrateurs ({allAccounts.length} comptes)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Créer un compte gratuit
        </Button>
      </div>

      <FreeAccountsStats />
      
      <FreeAccountsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        accountTypeFilter={accountTypeFilter}
        onAccountTypeChange={setAccountTypeFilter}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      <FreeAccountsTable filteredAccounts={filteredAccounts} />

      <CreateFreeAccountDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
    </div>
  );
};

export default FreeAccountsPanel;
