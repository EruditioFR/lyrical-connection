
import { useState, useMemo } from 'react';

export const useFreeAccountsFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const activeFiltersCount = useMemo(() => {
    return [
      searchTerm,
      accountTypeFilter !== 'all' ? accountTypeFilter : '',
      dateFilter !== 'all' ? dateFilter : ''
    ].filter(Boolean).length;
  }, [searchTerm, accountTypeFilter, dateFilter]);

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

  return {
    searchTerm,
    setSearchTerm,
    accountTypeFilter,
    setAccountTypeFilter,
    dateFilter,
    setDateFilter,
    activeFiltersCount,
    clearFilters,
    applyFilters
  };
};
