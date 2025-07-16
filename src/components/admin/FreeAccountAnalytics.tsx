
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAdminManagement } from '@/hooks/useAdminManagement';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Calendar, Users, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface FreeAccountAnalyticsProps {
  accountType?: 'artist' | 'professional';
}

const FreeAccountAnalytics = ({ accountType }: FreeAccountAnalyticsProps) => {
  const { freeAccounts, isLoadingFreeAccounts } = useAdminManagement();
  const { data: adminStats, isLoading: isLoadingAdminStats } = useAdminStats();

  // Always call React.useMemo hooks, regardless of loading state
  const accountsToAnalyze = React.useMemo(() => {
    if (!freeAccounts) return [];
    
    return accountType 
      ? accountType === 'artist' 
        ? freeAccounts.artists || []
        : freeAccounts.professionals || []
      : [...(freeAccounts.artists || []), ...(freeAccounts.professionals || [])];
  }, [freeAccounts, accountType]);

  const monthlyData = React.useMemo(() => {
    if (!accountsToAnalyze.length) return [];
    
    const monthCounts: Record<string, number> = {};
    
    accountsToAnalyze.forEach(account => {
      const date = new Date(account.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    return Object.entries(monthCounts)
      .map(([month, count]) => ({
        month,
        count,
        label: new Date(month + '-01').toLocaleDateString('fr-FR', { 
          month: 'short', 
          year: 'numeric' 
        })
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Derniers 12 mois
  }, [accountsToAnalyze]);

  const typeDistribution = React.useMemo(() => {
    if (!freeAccounts) return [];
    
    if (accountType) {
      return [{ name: accountType === 'artist' ? 'Artistes' : 'Professionnels', value: accountsToAnalyze.length }];
    }
    
    return [
      { name: 'Artistes', value: freeAccounts.artists?.length || 0 },
      { name: 'Professionnels', value: freeAccounts.professionals?.length || 0 }
    ];
  }, [accountsToAnalyze, freeAccounts, accountType]);

  // Early return after all hooks have been called
  if (isLoadingFreeAccounts || isLoadingAdminStats) {
    return <div>Chargement des analytics...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const getTitle = () => {
    if (accountType === 'artist') return 'Analytics des comptes artistes';
    if (accountType === 'professional') return 'Analytics des comptes professionnels';
    return 'Analytics des comptes gratuits';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{getTitle()}</h2>
        <p className="text-muted-foreground">
          Analyse détaillée des données et tendances
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Graphique des créations mensuelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Créations mensuelles
            </CardTitle>
            <CardDescription>
              Évolution du nombre de comptes créés par mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        {!accountType && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Répartition par type
              </CardTitle>
              <CardDescription>
                Distribution entre artistes et professionnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Statistiques additionnelles */}
        <Card className={!accountType ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métriques clés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold">{accountsToAnalyze.length}</div>
                <div className="text-sm text-muted-foreground">Total comptes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {monthlyData.length > 0 ? monthlyData[monthlyData.length - 1]?.count || 0 : 0}
                </div>
                <div className="text-sm text-muted-foreground">Créés ce mois</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {monthlyData.length > 1 
                    ? ((monthlyData[monthlyData.length - 1]?.count || 0) / (monthlyData[monthlyData.length - 2]?.count || 1) * 100).toFixed(0)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Croissance mensuelle</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreeAccountAnalytics;
