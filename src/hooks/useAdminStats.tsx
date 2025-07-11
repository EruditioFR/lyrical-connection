
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

      // Récupérer les données détaillées de TOUS les artistes (gratuits et payants)
      const { data: artistsData } = await supabase
        .from('artist_profiles')
        .select('nationality, voice_type, gender, birth_date')
        .eq('is_active', true);

      // Statistiques de nationalité
      const nationalityStats = artistsData?.reduce((acc, artist) => {
        const nationality = artist.nationality || 'Non spécifié';
        acc[nationality] = (acc[nationality] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topNationalities = Object.entries(nationalityStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([nationality, count]) => ({ nationality, count }));

      // Statistiques de répartition par sexe
      const genderStats = artistsData?.reduce((acc, artist) => {
        const gender = artist.gender || 'Non spécifié';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const genderDistribution = Object.entries(genderStats).map(([gender, count]) => ({
        gender: gender === 'H' ? 'Homme' : gender === 'F' ? 'Femme' : gender,
        count
      }));

      // Statistiques des types de voix
      const voiceTypeStats = artistsData?.reduce((acc, artist) => {
        if (artist.voice_type) {
          acc[artist.voice_type] = (acc[artist.voice_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const voiceTypeDistribution = Object.entries(voiceTypeStats)
        .sort(([, a], [, b]) => b - a)
        .map(([voiceType, count]) => ({ voiceType, count }));

      // Statistiques des types de voix par sexe
      const voiceTypeByGender = artistsData?.reduce((acc, artist) => {
        if (artist.voice_type && artist.gender) {
          const gender = artist.gender === 'H' ? 'Homme' : artist.gender === 'F' ? 'Femme' : 'Autre';
          if (!acc[gender]) acc[gender] = {};
          acc[gender][artist.voice_type] = (acc[gender][artist.voice_type] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, Record<string, number>>) || {};

      // Statistiques par âge
      const currentYear = new Date().getFullYear();
      const ageStats = artistsData?.reduce((acc, artist) => {
        if (artist.birth_date) {
          const birthYear = new Date(artist.birth_date).getFullYear();
          const age = currentYear - birthYear;
          
          let ageGroup = 'Non spécifié';
          if (age < 18) ageGroup = 'Moins de 18 ans';
          else if (age < 25) ageGroup = '18-24 ans';
          else if (age < 35) ageGroup = '25-34 ans';
          else if (age < 45) ageGroup = '35-44 ans';
          else if (age < 55) ageGroup = '45-54 ans';
          else if (age < 65) ageGroup = '55-64 ans';
          else ageGroup = '65 ans et plus';
          
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
        } else {
          acc['Non spécifié'] = (acc['Non spécifié'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const ageDistribution = Object.entries(ageStats).map(([ageGroup, count]) => ({
        ageGroup,
        count
      }));

      return {
        totalActiveUsers,
        userGrowthPercentage,
        pendingVerifications,
        activeCastings,
        castingGrowthPercentage,
        publishedEvents,
        recentApplications,
        pendingContacts,
        nationalityStats: topNationalities,
        genderDistribution,
        voiceTypeDistribution,
        voiceTypeByGender,
        ageDistribution
      };
    },
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
};
