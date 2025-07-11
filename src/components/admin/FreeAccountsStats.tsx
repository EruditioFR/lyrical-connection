
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

const FreeAccountsStats = () => {
  const { freeAccounts, isLoadingFreeAccounts } = useAdminManagement();

  if (isLoadingFreeAccounts) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalFreeAccounts = (freeAccounts?.artists?.length || 0) + (freeAccounts?.professionals?.length || 0);
  const recentAccounts = [...(freeAccounts?.artists || []), ...(freeAccounts?.professionals || [])]
    .filter(account => {
      const createdAt = new Date(account.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdAt >= sevenDaysAgo;
    }).length;

  const oldAccounts = [...(freeAccounts?.artists || []), ...(freeAccounts?.professionals || [])]
    .filter(account => {
      const createdAt = new Date(account.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdAt <= thirtyDaysAgo;
    }).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total comptes gratuits</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFreeAccounts}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{freeAccounts?.artists?.length || 0} Artistes</Badge>
            <Badge variant="outline">{freeAccounts?.professionals?.length || 0} Pros</Badge>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0%</div>
          <p className="text-xs text-muted-foreground">
            Gratuit → Payant
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FreeAccountsStats;
