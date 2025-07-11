
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Récupérer le nombre d'utilisateurs actifs
      const { count: activeUsers } = await supabase
        .from('artist_profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      const { count: activeProfessionals } = await supabase
        .from('professional_profiles')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      const totalActiveUsers = (activeUsers || 0) + (activeProfessionals || 0);

      // Récupérer le nombre de demandes de vérification en attente
      const { count: pendingVerifications } = await supabase
        .from('verification_requests')
        .select('*', { count: 'exact' })
        .eq('status', 'pending');

      // Récupérer le nombre de castings actifs
      const { count: activeCastings } = await supabase
        .from('castings')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Récupérer le nombre d'événements publiés
      const { count: publishedEvents } = await supabase
        .from('professional_events')
        .select('*', { count: 'exact' })
        .eq('status', 'published');

      // Récupérer les candidatures récentes (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: recentApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Récupérer les contacts professionnels non traités
      const { count: pendingContacts } = await supabase
        .from('professional_contacts')
        .select('*', { count: 'exact' })
        .eq('status', 'sent');

      // Calculer la croissance mensuelle des utilisateurs
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { count: lastMonthUsers } = await supabase
        .from('artist_profiles')
        .select('*', { count: 'exact' })
        .lte('created_at', lastMonth.toISOString());

      const { count: lastMonthProfessionals } = await supabase
        .from('professional_profiles')
        .select('*', { count: 'exact' })
        .lte('created_at', lastMonth.toISOString());

      const totalLastMonthUsers = (lastMonthUsers || 0) + (lastMonthProfessionals || 0);
      const userGrowthPercentage = totalLastMonthUsers > 0 
        ? Math.round(((totalActiveUsers - totalLastMonthUsers) / totalLastMonthUsers) * 100)
        : 0;

      // Calculer la croissance hebdomadaire des castings
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { count: lastWeekCastings } = await supabase
        .from('castings')
        .select('*', { count: 'exact' })
        .lte('created_at', lastWeek.toISOString())
        .eq('is_active', true);

      const castingGrowthPercentage = lastWeekCastings > 0 
        ? Math.round((((activeCastings || 0) - lastWeekCastings) / lastWeekCastings) * 100)
        : 0;

      return {
        totalActiveUsers,
        userGrowthPercentage,
        pendingVerifications,
        activeCastings,
        castingGrowthPercentage,
        publishedEvents,
        recentApplications,
        pendingContacts
      };
    },
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
};
