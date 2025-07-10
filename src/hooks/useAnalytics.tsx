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

      // Get total views
      const { count: totalViews } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact' })
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType);

      // Get unique views (distinct by IP or viewer_id)
      const { data: uniqueViewsData } = await supabase
        .from('profile_views')
        .select('viewer_id, ip_address')
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType);

      const uniqueViews = uniqueViewsData ? 
        new Set(uniqueViewsData.map(v => v.viewer_id || v.ip_address)).size : 0;

      // Get daily views for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: dailyViewsData } = await supabase
        .from('profile_views')
        .select('created_at')
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Group by day
      const dailyViews = dailyViewsData?.reduce((acc, view) => {
        const date = new Date(view.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const dailyViewsArray = Object.entries(dailyViews).map(([date, count]) => ({
        date,
        count
      }));

      // Get weekly views for last 12 weeks
      const twelveWeeksAgo = new Date();
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

      const { data: weeklyViewsData } = await supabase
        .from('profile_views')
        .select('created_at')
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType)
        .gte('created_at', twelveWeeksAgo.toISOString());

      // Group by week
      const weeklyViews = weeklyViewsData?.reduce((acc, view) => {
        const date = new Date(view.created_at);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const week = weekStart.toISOString().split('T')[0];
        acc[week] = (acc[week] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const weeklyViewsArray = Object.entries(weeklyViews).map(([week, count]) => ({
        week,
        count
      }));

      // Get monthly views for last 12 months
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const { data: monthlyViewsData } = await supabase
        .from('profile_views')
        .select('created_at')
        .eq('viewed_profile_id', profileId)
        .eq('profile_type', profileType)
        .gte('created_at', twelveMonthsAgo.toISOString());

      // Group by month
      const monthlyViews = monthlyViewsData?.reduce((acc, view) => {
        const date = new Date(view.created_at);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const monthlyViewsArray = Object.entries(monthlyViews).map(([month, count]) => ({
        month,
        count
      }));

      return {
        totalViews: totalViews || 0,
        uniqueViews,
        dailyViews: dailyViewsArray,
        weeklyViews: weeklyViewsArray,
        monthlyViews: monthlyViewsArray,
        viewsByType: [{ profile_type: profileType, count: totalViews || 0 }]
      };
    },
    enabled: !!user && !!profileId && !!profileType
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