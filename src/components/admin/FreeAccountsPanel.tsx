import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { freeAccounts, isLoadingFreeAccounts } = useAdminManagement();
  const [filters, setFilters] = useState({
    search: '',
    voiceType: '',
    nationality: '',
    professionalRole: '',
    location: '',
    experienceMin: '',
    experienceMax: '',
  });

  // Fonction pour rafraîchir les données après modification
  const handleAccountUpdated = () => {
    // Les données seront automatiquement rafraîchies grâce à React Query
    window.location.reload();
  };

  const filterAccounts = (accounts: any[]) => {
    let filtered = [...accounts];

    if (filters.search) {
      filtered = filtered.filter(account =>
        account.stage_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        account.company_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        account.contact_email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.voiceType) {
      filtered = filtered.filter(account => account.voice_type === filters.voiceType);
    }

    if (filters.nationality) {
      filtered = filtered.filter(account => account.nationality === filters.nationality);
    }

    if (filters.professionalRole) {
      filtered = filtered.filter(account => account.professional_role === filters.professionalRole);
    }

    if (filters.location) {
      filtered = filtered.filter(account =>
        account.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.experienceMin) {
      filtered = filtered.filter(account =>
        (account.experience_years || 0) >= parseInt(filters.experienceMin)
      );
    }

    if (filters.experienceMax) {
      filtered = filtered.filter(account =>
        (account.experience_years || 0) <= parseInt(filters.experienceMax)
      );
    }

    return filtered;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      voiceType: '',
      nationality: '',
      professionalRole: '',
      location: '',
      experienceMin: '',
      experienceMax: '',
    });
  };

  const onFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const applyFilters = (accounts: any[]) => {
    return accounts.filter(account => {
      const matchesSearch = !filters.search || 
        (account.stage_name?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (account.company_name?.toLowerCase().includes(filters.search.toLowerCase())) ||
        (account.contact_email?.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesVoiceType = !filters.voiceType || account.voice_type === filters.voiceType;
      const matchesNationality = !filters.nationality || account.nationality === filters.nationality;
      const matchesProfessionalRole = !filters.professionalRole || account.professional_role === filters.professionalRole;
      const matchesLocation = !filters.location || account.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      const experienceYears = account.experience_years || 0;
      const matchesExperienceMin = !filters.experienceMin || experienceYears >= parseInt(filters.experienceMin);
      const matchesExperienceMax = !filters.experienceMax || experienceYears <= parseInt(filters.experienceMax);

      return matchesSearch && matchesVoiceType && matchesNationality && 
             matchesProfessionalRole && matchesLocation && 
             matchesExperienceMin && matchesExperienceMax;
    });
  };

  if (!freeAccounts) {
    return <div>Chargement...</div>;
  }

  // Filtrer par type de compte si spécifié
  let accountsToFilter = [];
  if (accountType === 'artist') {
    accountsToFilter = freeAccounts.artists.map(account => ({ ...account, type: 'artist' as const }));
  } else if (accountType === 'professional') {
    accountsToFilter = freeAccounts.professionals.map(account => ({ ...account, type: 'professional' as const }));
  } else {
    accountsToFilter = [
      ...freeAccounts.artists.map(account => ({ ...account, type: 'artist' as const })),
      ...freeAccounts.professionals.map(account => ({ ...account, type: 'professional' as const }))
    ];
  }

  const filteredAccounts = applyFilters(accountsToFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {accountType === 'artist' && 'Gestion des Comptes Artistes Gratuits'}
            {accountType === 'professional' && 'Gestion des Comptes Professionnels Gratuits'}
            {!accountType && 'Gestion des Comptes Gratuits'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {accountType === 'artist' && 'Créez et gérez les comptes artistes gratuits'}
            {accountType === 'professional' && 'Créez et gérez les comptes professionnels gratuits'}
            {!accountType && 'Créez et gérez les comptes gratuits pour les artistes et professionnels'}
          </p>
        </div>
        <CreateFreeAccountDialog accountType={accountType} />
      </div>

      <FreeAccountsStats 
        freeAccounts={freeAccounts} 
        accountType={accountType}
      />
      
      <FreeAccountsFilters 
        filters={filters}
        onFiltersChange={setFilters}
        accountType={accountType}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            Comptes {accountType === 'artist' ? 'artistes' : accountType === 'professional' ? 'professionnels' : ''} créés
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

      <FreeAccountAnalytics 
        freeAccounts={freeAccounts} 
        accountType={accountType}
      />
    </div>
  );
};

export default FreeAccountsPanel;
