import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { computeViewStats, PERIOD_DAYS, type ViewStats } from '@/utils/profileViewStats';

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

export type AnalyticsData = ViewStats;

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
      // Vraies visites des 12 dernières semaines (plus de données simulées)
      const since = new Date(Date.now() - PERIOD_DAYS * 86_400_000).toISOString();
      const { data, error } = await supabase
        .from('profile_views')
        .select('created_at, viewer_id')
        .eq('viewed_profile_id', profileId!)
        .eq('profile_type', profileType!)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) throw error;
      return computeViewStats(data ?? []);
    },
    enabled: !!user && !!profileId && !!profileType,
    staleTime: 5 * 60 * 1000,
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