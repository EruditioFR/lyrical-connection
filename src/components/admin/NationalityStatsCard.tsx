
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NationalityStatsCardProps {
  nationalityStats: Array<{ nationality: string; count: number }>;
  isLoading?: boolean;
}

const NationalityStatsCard = ({ nationalityStats, isLoading }: NationalityStatsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Nationalités</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
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

  const totalUsers = nationalityStats.reduce((sum, stat) => sum + stat.count, 0);
  const topNationality = nationalityStats[0];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Nationalités</CardTitle>
        <Globe className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topNationality ? topNationality.nationality : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Nationalité la plus représentée ({topNationality?.count || 0} artistes)
        </p>
        
        <div className="space-y-2">
          {nationalityStats.slice(0, 3).map((stat, index) => {
            const percentage = totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
            return (
              <div key={stat.nationality} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="truncate max-w-[120px]">{stat.nationality}</span>
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
          
          {nationalityStats.length > 3 && (
            <div className="text-xs text-muted-foreground pt-1 border-t">
              +{nationalityStats.length - 3} autres nationalités
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NationalityStatsCard;
