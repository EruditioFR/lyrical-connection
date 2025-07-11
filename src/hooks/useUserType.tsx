
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useAuth } from '@/hooks/useAuth';

export const useUserType = () => {
  const { user } = useAuth();
  const { profile: artistProfile, isLoading: artistLoading } = useArtistProfile();
  const { profile: professionalProfile, isLoading: professionalLoading } = useProfessionalProfile();

  const isLoading = artistLoading || professionalLoading;
  
  // Forcer le statut professionnel pour les utilisateurs jbbejot (utilisateurs de test)
  // Sauf pour jbbejot@gmail.com et jbbejot+abaldo@gmail.com qui doivent avoir un profil artiste
  const isTestUser = user?.email?.startsWith('jbbejot');
  const isMainTestUser = user?.email === 'jbbejot@gmail.com';
  const isBaldoUser = user?.email === 'jbbejot+abaldo@gmail.com';
  
  if (isTestUser && !isMainTestUser && !isBaldoUser) {
    // Pour les utilisateurs de test jbbejot* (sauf jbbejot@gmail.com et jbbejot+abaldo@gmail.com), toujours considérer comme professionnel
    return {
      userType: 'professional' as const,
      isProfessional: true,
      isArtist: false,
      isLoading,
      artistProfile: null,
      professionalProfile,
    };
  }

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
