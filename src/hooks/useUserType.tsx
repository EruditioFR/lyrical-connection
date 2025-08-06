
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useAuth } from '@/hooks/useAuth';

export const useUserType = () => {
  // All hooks must be called unconditionally at the top
  const { user } = useAuth();
  const { profile: artistProfile, isLoading: artistLoading } = useArtistProfile();
  const { profile: professionalProfile, isLoading: professionalLoading } = useProfessionalProfile();

  // Calculate loading state
  const isLoading = artistLoading || professionalLoading;
  
  // Early return for loading state - but only after all hooks are called
  if (isLoading) {
    return {
      userType: null,
      isProfessional: false,
      isArtist: false,
      isLoading: true,
      artistProfile: null,
      professionalProfile: null,
    };
  }

  // Calculate test user conditions
  const isTestUser = user?.email?.startsWith('jbbejot') || false;
  const isMainTestUser = user?.email === 'jbbejot@gmail.com';
  const isBaldoUser = user?.email === 'jbbejot+abaldo@gmail.com';
  const isMlombardUser = user?.email === 'jbbejot+mlombard@gmail.com';
  const isFvalentinUser = user?.email === 'jbbejot+fvalentin@gmail.com';
  
  // Determine user type
  let userType = null;
  let isProfessional = false;
  let isArtist = false;
  let finalArtistProfile = null;
  let finalProfessionalProfile = null;

  // Special logic for test users
  if (isTestUser && !isMainTestUser && !isBaldoUser && !isMlombardUser && !isFvalentinUser) {
    // For test users jbbejot* (except exceptions), always consider as professional
    userType = 'professional' as const;
    isProfessional = true;
    isArtist = false;
    finalArtistProfile = null;
    finalProfessionalProfile = professionalProfile;
  } else {
    // Normal logic: user can only be one type
    const hasProfessionalProfile = !!professionalProfile;
    const hasArtistProfile = !!artistProfile;
    
    if (hasProfessionalProfile) {
      userType = 'professional' as const;
      isProfessional = true;
      isArtist = false;
      finalArtistProfile = null;
      finalProfessionalProfile = professionalProfile;
    } else if (hasArtistProfile) {
      userType = 'artist' as const;
      isProfessional = false;
      isArtist = true;
      finalArtistProfile = artistProfile;
      finalProfessionalProfile = null;
    } else {
      // No profile found
      userType = null;
      isProfessional = false;
      isArtist = false;
      finalArtistProfile = null;
      finalProfessionalProfile = null;
    }
  }

  // Single return statement at the end
  return {
    userType,
    isProfessional,
    isArtist,
    isLoading: false,
    artistProfile: finalArtistProfile,
    professionalProfile: finalProfessionalProfile,
  };
};
