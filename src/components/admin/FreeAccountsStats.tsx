
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  Clock,
  CreditCard,
  Calendar,
  Target
} from 'lucide-react';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { useAdminStats } from '@/hooks/useAdminStats';
import NationalityStatsCard from './NationalityStatsCard';
import GenderStatsCard from './GenderStatsCard';
import VoiceTypeStatsCard from './VoiceTypeStatsCard';
import AgeStatsCard from './AgeStatsCard';
import FreeAccountsStatsLoading from './FreeAccountsStatsLoading';

interface FreeAccountsStatsProps {
  accountType?: 'artist' | 'professional';
}

const FreeAccountsStats = ({ accountType }: FreeAccountsStatsProps) => {
  const { freeAccounts, isLoadingFreeAccounts } = useAdminManagement();
  const { data: adminStats, isLoading: isLoadingAdminStats } = useAdminStats();

  if (isLoadingFreeAccounts || isLoadingAdminStats) {
    return <FreeAccountsStatsLoading />;
  }

  // Calculer le vrai total des comptes gratuits basé sur les statistiques d'abonnement
  const totalUsers = adminStats?.totalUsers || 0;
  const totalPaidAccounts = adminStats?.paidUsers || 0;
  const realTotalFreeAccounts = totalUsers - totalPaidAccounts;

  // Comptes créés par les admins (pour l'affichage séparé)
  const adminCreatedArtists = freeAccounts?.artists?.length || 0;
  const adminCreatedProfessionals = freeAccounts?.professionals?.length || 0;
  const adminCreatedAccounts = adminCreatedArtists + adminCreatedProfessionals;
  
  // Filtrer selon le type de compte si spécifié
  const accountsToAnalyze = accountType 
    ? accountType === 'artist' 
      ? freeAccounts?.artists || []
      : freeAccounts?.professionals || []
    : [...(freeAccounts?.artists || []), ...(freeAccounts?.professionals || [])];

  const recentAccounts = accountsToAnalyze.filter(account => {
    const createdAt = new Date(account.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdAt >= sevenDaysAgo;
  }).length;

  const oldAccounts = accountsToAnalyze.filter(account => {
    const createdAt = new Date(account.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdAt <= thirtyDaysAgo;
  }).length;

  // Calculer le taux de conversion réel
  const conversionRate = totalUsers > 0 
    ? ((totalPaidAccounts / totalUsers) * 100).toFixed(1)
    : '0';

  const getStatsTitle = () => {
    if (accountType === 'artist') return 'Total comptes artistes gratuits';
    if (accountType === 'professional') return 'Total comptes professionnels gratuits';
    return 'Total comptes gratuits';
  };

  const getDisplayValue = () => {
    if (accountType === 'artist') return adminCreatedArtists;
    if (accountType === 'professional') return adminCreatedProfessionals;
    return realTotalFreeAccounts;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getStatsTitle()}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDisplayValue()}</div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {!accountType && (
                <>
                  <Badge variant="secondary">{adminCreatedAccounts} créés par admin</Badge>
                  <Badge variant="outline">{totalPaidAccounts} payants</Badge>
                </>
              )}
              {accountType && (
                <Badge variant="secondary">Créés par admin</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux (7j)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Comptes créés cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anciens (30j+)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oldAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Comptes éligibles à l'upgrade
            </p>
          </CardContent>
        </Card>

        {!accountType && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Gratuit → Payant
              </p>
            </CardContent>
          </Card>
        )}

        {!accountType && (
          <NationalityStatsCard 
            nationalityStats={adminStats?.nationalityStats || []} 
            isLoading={isLoadingAdminStats}
          />
        )}
      </div>

      {/* Statistiques démographiques - seulement pour la vue globale ou artistes */}
      {(!accountType || accountType === 'artist') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <GenderStatsCard 
            genderDistribution={adminStats?.genderDistribution || []} 
            isLoading={isLoadingAdminStats}
          />
          
          <VoiceTypeStatsCard 
            voiceTypeDistribution={adminStats?.voiceTypeDistribution || []}
            voiceTypeByGender={adminStats?.voiceTypeByGender || {}}
            isLoading={isLoadingAdminStats}
          />
          
          <AgeStatsCard 
            ageDistribution={adminStats?.ageDistribution || []}
            isLoading={isLoadingAdminStats}
          />
        </div>
      )}
    </div>
  );
};

export default FreeAccountsStats;
