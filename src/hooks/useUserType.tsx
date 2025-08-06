
import { useArtistProfile } from '@/hooks/useArtistProfile';
import { useProfessionalProfile } from '@/hooks/useProfessionalProfile';
import { useAuth } from '@/hooks/useAuth';

export const useUserType = () => {
  const { user } = useAuth();
  const { profile: artistProfile, isLoading: artistLoading } = useArtistProfile();
  const { profile: professionalProfile, isLoading: professionalLoading } = useProfessionalProfile();

  const isLoading = artistLoading || professionalLoading;
  
  // Variables pour les conditions de test, calculées une seule fois
  const isTestUser = user?.email?.startsWith('jbbejot') || false;
  const isMainTestUser = user?.email === 'jbbejot@gmail.com';
  const isBaldoUser = user?.email === 'jbbejot+abaldo@gmail.com';
  const isMlombardUser = user?.email === 'jbbejot+mlombard@gmail.com';
  const isFvalentinUser = user?.email === 'jbbejot+fvalentin@gmail.com';
  
  // Logique de détermination du type d'utilisateur - pas de retour prématuré
  let userType = null;
  let isProfessional = false;
  let isArtist = false;
  let finalArtistProfile = null;
  let finalProfessionalProfile = null;

  // Forcer le statut professionnel pour les utilisateurs jbbejot (utilisateurs de test)
  // Sauf pour jbbejot@gmail.com, jbbejot+abaldo@gmail.com, jbbejot+mlombard@gmail.com et jbbejot+fvalentin@gmail.com qui doivent avoir un profil artiste
  if (isTestUser && !isMainTestUser && !isBaldoUser && !isMlombardUser && !isFvalentinUser) {
    // Pour les utilisateurs de test jbbejot* (sauf les exceptions), toujours considérer comme professionnel
    userType = 'professional' as const;
    isProfessional = true;
    isArtist = false;
    finalArtistProfile = null;
    finalProfessionalProfile = professionalProfile;
  } else {
    // Logique normale : un utilisateur ne peut être que l'un ou l'autre, jamais les deux
    const hasProfessionalProfile = !!professionalProfile;
    const hasArtistProfile = !!artistProfile;
    
    // Si l'utilisateur a un profil professionnel, il est professionnel (priorité)
    if (hasProfessionalProfile) {
      userType = 'professional' as const;
      isProfessional = true;
      isArtist = false;
      finalArtistProfile = null; // Ne pas retourner le profil artiste s'il y en a un
      finalProfessionalProfile = professionalProfile;
    } else if (hasArtistProfile) {
      // Si l'utilisateur a seulement un profil artiste, il est artiste
      userType = 'artist' as const;
      isProfessional = false;
      isArtist = true;
      finalArtistProfile = artistProfile;
      finalProfessionalProfile = null; // Ne pas retourner le profil professionnel s'il y en a un
    } else {
      // Aucun profil trouvé
      userType = null;
      isProfessional = false;
      isArtist = false;
      finalArtistProfile = null;
      finalProfessionalProfile = null;
    }
  }

  // Retour unique à la fin pour respecter les règles des hooks
  return {
    userType,
    isProfessional,
    isArtist,
    isLoading,
    artistProfile: finalArtistProfile,
    professionalProfile: finalProfessionalProfile,
  };
};
