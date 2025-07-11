import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';

export const useUserType = () => {
  const { profile: artistProfile, isLoading: artistLoading } = useArtistProfile();
  const { profile: professionalProfile, isLoading: professionalLoading } = useProfessionalProfile();

  const isLoading = artistLoading || professionalLoading;
  const isProfessional = !!professionalProfile && !artistProfile;
  const isArtist = !!artistProfile && !professionalProfile;
  const userType = isProfessional ? 'professional' : isArtist ? 'artist' : null;

  return {
    userType,
    isProfessional,
    isArtist,
    isLoading,
    artistProfile,
    professionalProfile,
  };
};