import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserType = 'artist' | 'professional' | 'unknown';

export const useUserType = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user-type', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          userType: 'unknown' as UserType,
          artistProfile: null,
          professionalProfile: null
        };
      }

      // Check if user has an artist profile
      const { data: artistProfile } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (artistProfile) {
        return {
          userType: 'artist' as UserType,
          artistProfile,
          professionalProfile: null
        };
      }

      // Check if user has a professional profile
      const { data: professionalProfile } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (professionalProfile) {
        return {
          userType: 'professional' as UserType,
          artistProfile: null,
          professionalProfile
        };
      }

      return {
        userType: 'unknown' as UserType,
        artistProfile: null,
        professionalProfile: null
      };
    },
    enabled: !!user?.id
  });

  const userType = data?.userType || 'unknown';
  const artistProfile = data?.artistProfile;
  const professionalProfile = data?.professionalProfile;
  const isArtist = userType === 'artist';
  const isProfessional = userType === 'professional';

  return { 
    userType, 
    artistProfile,
    professionalProfile,
    isArtist,
    isProfessional,
    isLoading 
  };
};