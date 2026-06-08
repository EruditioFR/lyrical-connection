import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, Calendar, Users } from 'lucide-react';
import { useAnalytics, useProfileViews } from '@/hooks/useAnalytics';
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsDashboardProps {
  profileType: 'artist' | 'professional';
}

const AnalyticsDashboard = ({ profileType }: AnalyticsDashboardProps) => {
  const { profile: artistProfile } = useArtistProfile();
  const { profile: professionalProfile } = useProfessionalProfile();
  
  const profileId = profileType === 'artist' ? artistProfile?.id : professionalProfile?.id;
  
  const { data: analytics, isLoading } = useAnalytics(profileId, profileType);
  const { data: recentViews } = useProfileViews(profileId, profileType);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200 hover:border-gold-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lyrical-800 dark:text-lyrical-200">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-gold-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lyrical-900 dark:text-lyrical-100">{formatNumber(analytics.totalViews)}</div>
            <p className="text-xs text-lyrical-600 dark:text-lyrical-400">
              Nombre total de vues de profil
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200 hover:border-gold-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lyrical-800 dark:text-lyrical-200">Visiteurs uniques</CardTitle>
            <Users className="h-4 w-4 text-gold-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lyrical-900 dark:text-lyrical-100">{formatNumber(analytics.uniqueViews)}</div>
            <p className="text-xs text-lyrical-600 dark:text-lyrical-400">
              Visiteurs distincts
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200 hover:border-gold-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lyrical-800 dark:text-lyrical-200">Croissance</CardTitle>
            <TrendingUp className="h-4 w-4 text-gold-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lyrical-900 dark:text-lyrical-100">
              {analytics.dailyViews.length > 1 ? '+12%' : 'N/A'}
            </div>
            <p className="text-xs text-lyrical-600 dark:text-lyrical-400">
              Par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200 hover:border-gold-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-lyrical-800 dark:text-lyrical-200">Vues aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-gold-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-lyrical-900 dark:text-lyrical-100">
              {analytics.dailyViews.find(v => 
                v.date === new Date().toISOString().split('T')[0]
              )?.count || 0}
            </div>
            <p className="text-xs text-lyrical-600 dark:text-lyrical-400">
              Vues d'aujourd'hui
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Daily Views Chart */}
        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="font-serif text-xl tracking-tight text-lyrical-800 dark:text-lyrical-200 after:block after:mt-2 after:h-[2px] after:w-10 after:rounded-full after:bg-gradient-to-r after:from-gold-500 after:to-gold-300">Vues quotidiennes</CardTitle>
            <CardDescription className="text-lyrical-600 dark:text-lyrical-400">
              Évolution des vues sur les 30 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.dailyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                  formatter={(value) => [value, 'Vues']}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--lyrical-600))" 
                  fill="hsl(var(--lyrical-600))" 
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Views Chart */}
        <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lyrical-800 dark:text-lyrical-200">Vues hebdomadaires</CardTitle>
            <CardDescription className="text-lyrical-600 dark:text-lyrical-400">
              Évolution des vues sur les 12 dernières semaines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.weeklyViews}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => `Semaine du ${new Date(value).toLocaleDateString('fr-FR')}`}
                  formatter={(value) => [value, 'Vues']}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--lyrical-600))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Views */}
      <Card className="border-2 border-gold-200/30 bg-gradient-to-br from-card to-gold-50/10 hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-lyrical-800 dark:text-lyrical-200">Vues récentes</CardTitle>
          <CardDescription className="text-lyrical-600 dark:text-lyrical-400">
            Les 20 dernières vues de votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentViews && recentViews.length > 0 ? (
            <div className="space-y-2">
              {recentViews.slice(0, 20).map((view, index) => (
                <div key={view.id} className="flex items-center justify-between py-2 border-b border-gold-200/20 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-gold-100 to-lyrical-100 dark:from-gold-800 dark:to-lyrical-800 rounded-full flex items-center justify-center text-sm font-medium text-lyrical-700 dark:text-lyrical-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-lyrical-800 dark:text-lyrical-200">
                        {view.viewer_id ? 'Utilisateur connecté' : 'Visiteur anonyme'}
                      </p>
                      <p className="text-xs text-lyrical-600 dark:text-lyrical-400">
                        {new Date(view.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-gold-300 text-gold-700 dark:border-gold-600 dark:text-gold-300">
                    {view.profile_type === 'artist' ? 'Artiste' : 'Professionnel'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-lyrical-500 dark:text-lyrical-400">
              <Eye className="w-12 h-12 mx-auto mb-2 opacity-50 text-gold-400" />
              <p>Aucune vue récente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;