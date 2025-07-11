
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GenderStatsCardProps {
  genderDistribution: Array<{ gender: string; count: number }>;
  isLoading?: boolean;
}

const GenderStatsCard = ({ genderDistribution, isLoading }: GenderStatsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Répartition par sexe</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
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

  const totalUsers = genderDistribution.reduce((sum, stat) => sum + stat.count, 0);
  const topGender = genderDistribution.sort((a, b) => b.count - a.count)[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Répartition par sexe</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topGender ? `${topGender.gender} (${Math.round((topGender.count / totalUsers) * 100)}%)` : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Genre le plus représenté
        </p>
        
        <div className="space-y-2">
          {genderDistribution.map((stat) => {
            const percentage = totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
            return (
              <div key={stat.gender} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{stat.gender}</span>
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
      </CardContent>
    </Card>
  );
};

export default GenderStatsCard;
