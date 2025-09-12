import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Clock, Target, Award } from 'lucide-react';

export const CastingAnalytics = () => {
  // Mock data - would be replaced with real analytics
  const mockStats = {
    totalCastings: 45,
    activeCastings: 12,
    totalApplicants: 342,
    averageScoreAccuracy: 87.3,
    processingTimeReduction: 65,
    successfulMatches: 89
  };

  const mockRecentActivity = [
    { id: 1, casting: 'La Traviata - Violetta', applicants: 23, avgScore: 8.4, status: 'completed' },
    { id: 2, casting: 'Don Giovanni - Zerlina', applicants: 18, avgScore: 7.8, status: 'scoring' },
    { id: 3, casting: 'Carmen - Carmen', applicants: 31, avgScore: 9.1, status: 'active' }
  ];

  const mockCriteriaPerformance = [
    { criterion: 'Étendue vocale', accuracy: 92, usage: 100 },
    { criterion: 'Expérience', accuracy: 88, usage: 95 },
    { criterion: 'Disponibilité', accuracy: 94, usage: 87 },
    { criterion: 'Proximité géographique', accuracy: 76, usage: 73 },
    { criterion: 'Répertoire', accuracy: 85, usage: 92 }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Castings Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalCastings}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Candidats Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Moyenne de 7.6 candidats par casting
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Précision Scores</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.averageScoreAccuracy}%</div>
            <p className="text-xs text-muted-foreground">
              +5.2% d'amélioration continue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Gains de Performance
            </CardTitle>
            <CardDescription>
              Impact de l'automatisation sur vos processus
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Réduction temps de traitement</span>
              <Badge variant="default">{mockStats.processingTimeReduction}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Correspondances réussies</span>
              <Badge variant="default">{mockStats.successfulMatches}%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Castings actifs</span>
              <Badge variant="secondary">{mockStats.activeCastings}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance par Critère
            </CardTitle>
            <CardDescription>
              Efficacité de chaque critère d'évaluation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCriteriaPerformance.map((criteria, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{criteria.criterion}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline">{criteria.accuracy}% précis</Badge>
                      <Badge variant="secondary">{criteria.usage}% usage</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${criteria.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Activité Récente
          </CardTitle>
          <CardDescription>
            Castings récents et leurs performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-medium">{activity.casting}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activity.applicants} candidats • Score moyen: {activity.avgScore}/10
                  </p>
                </div>
                <Badge 
                  variant={
                    activity.status === 'completed' ? 'default' :
                    activity.status === 'scoring' ? 'secondary' : 'outline'
                  }
                >
                  {activity.status === 'completed' ? 'Terminé' :
                   activity.status === 'scoring' ? 'Notation' : 'Actif'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};