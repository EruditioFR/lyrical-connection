
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceTypeStatsCardProps {
  voiceTypeDistribution: Array<{ voiceType: string; count: number }>;
  voiceTypeByGender: Record<string, Record<string, number>>;
  isLoading?: boolean;
}

const VoiceTypeStatsCard = ({ voiceTypeDistribution, voiceTypeByGender, isLoading }: VoiceTypeStatsCardProps) => {
  const [selectedGender, setSelectedGender] = useState<string>('all');

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Types de voix</CardTitle>
          <Music className="h-4 w-4 text-muted-foreground" />
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

  const getFilteredData = () => {
    if (selectedGender === 'all') {
      return voiceTypeDistribution;
    }
    
    const genderData = voiceTypeByGender[selectedGender] || {};
    return Object.entries(genderData).map(([voiceType, count]) => ({
      voiceType,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const filteredData = getFilteredData();
  const totalVoices = filteredData.reduce((sum, stat) => sum + stat.count, 0);
  const topVoiceType = filteredData[0];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Types de voix</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="Homme">Hommes</SelectItem>
              <SelectItem value="Femme">Femmes</SelectItem>
              <SelectItem value="Autre">Autres</SelectItem>
            </SelectContent>
          </Select>
          <Music className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {topVoiceType ? topVoiceType.voiceType : 'N/A'}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Type de voix le plus représenté ({topVoiceType?.count || 0} artistes)
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {filteredData.slice(0, Math.ceil(filteredData.length / 2)).map((stat) => {
              const percentage = totalVoices > 0 ? Math.round((stat.count / totalVoices) * 100) : 0;
              return (
                <div key={stat.voiceType} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[100px]">{stat.voiceType}</span>
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
            {filteredData.slice(Math.ceil(filteredData.length / 2)).map((stat) => {
              const percentage = totalVoices > 0 ? Math.round((stat.count / totalVoices) * 100) : 0;
              return (
                <div key={stat.voiceType} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[100px]">{stat.voiceType}</span>
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

export default VoiceTypeStatsCard;
