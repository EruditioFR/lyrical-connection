
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useAuth } from '@/hooks/useAuth';

export const useUserType = () => {
  const { user } = useAuth();
  const { profile: artistProfile, isLoading: artistLoading } = useArtistProfile();
  const { profile: professionalProfile, isLoading: professionalLoading } = useProfessionalProfile();

  const isLoading = artistLoading || professionalLoading;
  
  // Forcer le statut professionnel pour les utilisateurs jbbejot (utilisateurs de test)
  // Sauf pour jbbejot@gmail.com, jbbejot+abaldo@gmail.com et jbbejot+mlombard@gmail.com qui doivent avoir un profil artiste
  const isTestUser = user?.email?.startsWith('jbbejot');
  const isMainTestUser = user?.email === 'jbbejot@gmail.com';
  const isBaldoUser = user?.email === 'jbbejot+abaldo@gmail.com';
  const isMlombardUser = user?.email === 'jbbejot+mlombard@gmail.com';
  
  if (isTestUser && !isMainTestUser && !isBaldoUser && !isMlombardUser) {
    // Pour les utilisateurs de test jbbejot* (sauf les exceptions), toujours considérer comme professionnel
    return {
      userType: 'professional' as const,
      isProfessional: true,
      isArtist: false,
      isLoading,
      artistProfile: null,
      professionalProfile,
    };
  }

  // Logique corrigée : un utilisateur ne peut être que l'un ou l'autre, jamais les deux
  const hasProfessionalProfile = !!professionalProfile;
  const hasArtistProfile = !!artistProfile;
  
  // Si l'utilisateur a un profil professionnel, il est professionnel (priorité)
  if (hasProfessionalProfile) {
    return {
      userType: 'professional' as const,
      isProfessional: true,
      isArtist: false,
      isLoading,
      artistProfile: null, // Ne pas retourner le profil artiste s'il y en a un
      professionalProfile,
    };
  }
  
  // Si l'utilisateur a seulement un profil artiste, il est artiste
  if (hasArtistProfile) {
    return {
      userType: 'artist' as const,
      isProfessional: false,
      isArtist: true,
      isLoading,
      artistProfile,
      professionalProfile: null, // Ne pas retourner le profil professionnel s'il y en a un
    };
  }

  // Aucun profil trouvé
  return {
    userType: null,
    isProfessional: false,
    isArtist: false,
    isLoading,
    artistProfile: null,
    professionalProfile: null,
  };
};
