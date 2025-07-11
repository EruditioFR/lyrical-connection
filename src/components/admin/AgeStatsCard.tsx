
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AgeStatsCardProps {
  ageDistribution: Array<{ ageGroup: string; count: number }>;
  isLoading?: boolean;
}

const AgeStatsCard = ({ ageDistribution, isLoading }: AgeStatsCardProps) => {
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Répartition par âge</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = ageDistribution.reduce((sum, stat) => sum + stat.count, 0);
  const topAgeGroup = ageDistribution
    .filter(group => group.ageGroup !== 'Non spécifié')
    .sort((a, b) => b.count - a.count)[0];

  // Ordonner les groupes d'âge de manière logique
  const orderedAgeGroups = [
    'Moins de 18 ans',
    '18-24 ans',
    '25-34 ans',
    '35-44 ans',
    '45-54 ans',
    '55-64 ans',
    '65 ans et plus',
    'Non spécifié'
  ];

  const sortedAgeDistribution = orderedAgeGroups
    .map(ageGroup => ageDistribution.find(item => item.ageGroup === ageGroup))
    .filter(Boolean) as Array<{ ageGroup: string; count: number }>;

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Répartition par âge</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topAgeGroup ? topAgeGroup.ageGroup : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Tranche d'âge la plus représentée ({topAgeGroup?.count || 0} artistes)
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {sortedAgeDistribution.slice(0, Math.ceil(sortedAgeDistribution.length / 2)).map((stat) => {
              const percentage = totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
              return (
                <div key={stat.ageGroup} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{stat.ageGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.count}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="space-y-2">
            {sortedAgeDistribution.slice(Math.ceil(sortedAgeDistribution.length / 2)).map((stat) => {
              const percentage = totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
              return (
                <div key={stat.ageGroup} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[120px]">{stat.ageGroup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stat.count}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgeStatsCard;
