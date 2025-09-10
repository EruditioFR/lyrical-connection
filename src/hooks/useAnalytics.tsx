import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ProfileView {
  id: string;
  viewer_id: string | null;
  viewed_profile_id: string;
  profile_type: string;
  created_at: string;
  ip_address: string | null;
  session_id: string | null;
  user_agent: string | null;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  dailyViews: { date: string; count: number }[];
  weeklyViews: { week: string; count: number }[];
  monthlyViews: { month: string; count: number }[];
  viewsByType: { profile_type: string; count: number }[];
}

export const useProfileViews = (profileId?: string, profileType?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile-views', profileId, profileType],
    queryFn: async () => {
      if (!user || !profileId || !profileType) return [];

      const { data, error } = await supabase
        .from('profile_views')
        .select('*')
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as ProfileView[];
    },
    enabled: !!user && !!profileId && !!profileType
  });
};

export const useAnalytics = (profileId?: string, profileType?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', profileId, profileType],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!user || !profileId || !profileType) {
        return {
          totalViews: 0,
          uniqueViews: 0,
          dailyViews: [],
          weeklyViews: [],
          monthlyViews: [],
          viewsByType: []
        };
      }

      // 🎭 DONNÉES SIMULÉES POUR LA DÉMONSTRATION
      console.log('🎭 Génération de données analytiques simulées...');

      // Générer des vues quotidiennes simulées pour les 30 derniers jours
      const dailyViews = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Générer un nombre aléatoire de vues (entre 5 et 45)
        const baseViews = Math.floor(Math.random() * 40) + 5;
        // Ajouter une tendance croissante
        const trendBonus = Math.floor((29 - i) * 0.5);
        // Ajouter de la variabilité week-end (moins de vues)
        const weekendPenalty = [0, 6].includes(date.getDay()) ? -Math.floor(Math.random() * 10) : 0;
        
        const count = Math.max(1, baseViews + trendBonus + weekendPenalty);
        
        dailyViews.push({ date: dateStr, count });
      }

      // Générer des vues hebdomadaires simulées pour les 12 dernières semaines
      const weeklyViews = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        // Récupérer le lundi de cette semaine
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        const weekStr = weekStart.toISOString().split('T')[0];
        
        // Générer un nombre aléatoire de vues hebdomadaires (entre 50 et 200)
        const baseViews = Math.floor(Math.random() * 150) + 50;
        // Ajouter une tendance croissante
        const trendBonus = Math.floor((11 - i) * 8);
        
        const count = baseViews + trendBonus;
        
        weeklyViews.push({ week: weekStr, count });
      }

      // Générer des vues mensuelles simulées pour les 12 derniers mois
      const monthlyViews = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Générer un nombre aléatoire de vues mensuelles (entre 200 et 800)
        const baseViews = Math.floor(Math.random() * 600) + 200;
        // Ajouter une tendance croissante
        const trendBonus = Math.floor((11 - i) * 25);
        
        const count = baseViews + trendBonus;
        
        monthlyViews.push({ month, count });
      }

      // Calculer les totaux à partir des données simulées
      const totalViews = dailyViews.reduce((sum, day) => sum + day.count, 0) * 2; // Multiplier pour avoir un total plus réaliste
      const uniqueViews = Math.floor(totalViews * 0.7); // 70% des vues sont uniques

      return {
        totalViews,
        uniqueViews,
        dailyViews,
        weeklyViews,
        monthlyViews,
        viewsByType: [{ profile_type: profileType, count: totalViews }]
      };
    },
    enabled: !!user && !!profileId && !!profileType,
    staleTime: 5 * 60 * 1000, // 5 minutes de cache pour les données simulées
  });
};

export const useRecordProfileView = () => {
  const { user } = useAuth();

  const recordView = async (profileId: string, profileType: string) => {
    const { error } = await supabase
      .from('profile_views')
      .insert({
        viewer_id: user?.id || null,
        viewed_profile_id: profileId,
        profile_type: profileType,
        session_id: `${Date.now()}-${Math.random()}`,
        user_agent: navigator.userAgent
      });

    if (error) {
      console.error('Error recording profile view:', error);
    }
  };

  return { recordView };
};