
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  User,
  Music,
  Camera,
  MessageCircle,
  Edit,
  Play,
  Clock,
  Flag,
  Languages
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import PhotosTab from '@/components/profile/PhotosTab';
import RepertoireTab from '@/components/profile/RepertoireTab';
import ContactArtistDialog from '@/components/artists/ContactArtistDialog';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
import AirPlayer from '@/components/profile/AirPlayer';
import ArtistPhotoPreview from '@/components/profile/ArtistPhotoPreview';

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { artistProfile: currentUserProfile, isProfessional } = useUserType();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['artist-profile-public', id],
    queryFn: async () => {
      if (!id) throw new Error('ID manquant');
      
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Récupérer les photos pour obtenir la photo de profil
  const { photos, getPhotoUrl } = useArtistPhotos(id);
  const profilePhoto = photos?.find(photo => photo.is_profile_photo);

  // Si l'utilisateur connecté est un artiste et qu'il consulte son propre profil
  const isOwnProfile = user && currentUserProfile?.id === id;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
          <p className="text-gray-600">Ce profil d'artiste n'existe pas ou n'est plus actif.</p>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline" 
            className="mt-4"
          >
            Retour
          </Button>
        </div>
      </Layout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Utiliser la photo de profil de la galerie ou l'ancienne URL en fallback
  const avatarImageSrc = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : profile.profile_image_url;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div 
          className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative"
          style={{
            backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Bouton Editer en haut à droite */}
          {isOwnProfile && (
            <div className="absolute top-4 right-4">
              <Button 
                variant="secondary"
                onClick={() => window.location.href = '/profil'}
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editer mon profil
              </Button>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar avec AspectRatio pour éviter la déformation */}
              <div className="w-32 h-32 border-4 border-white shadow-lg rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {avatarImageSrc ? (
                  <AspectRatio ratio={1}>
                    <img 
                      src={avatarImageSrc} 
                      alt={profile.stage_name}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                    <span className="text-2xl font-bold">
                      {getInitials(profile.stage_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info principale */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.stage_name}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      {profile.voice_type && (
                        <Badge variant="secondary" className="text-sm">
                          {profile.voice_type}
                        </Badge>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.birth_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{calculateAge(profile.birth_date)} ans</span>
                        </div>
                      )}
                    </div>

                    {/* Layout avec biographie à gauche (60%) et photos à droite (40%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                      {/* Colonne de gauche - Biographie et informations (60%) */}
                      <div className="lg:col-span-3">
                        {/* Informations supplémentaires */}
                        <div className="mb-6 flex flex-wrap gap-6">
                          {profile.experience_years !== null && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{profile.experience_years}</span>
                              <span className="text-muted-foreground">années d'expérience</span>
                            </div>
                          )}
                          
                          {profile.nationality && (
                            <div className="flex items-center gap-2 text-sm">
                              <Flag className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">{profile.nationality}</span>
                            </div>
                          )}
                          
                          {profile.spoken_languages && profile.spoken_languages.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Languages className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-foreground">
                                {profile.spoken_languages.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Informations de contact */}
                        {(profile.contact_email || profile.phone || profile.website) && (
                          <div className="mb-6 space-y-3">
                            {profile.contact_email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a 
                                  href={`mailto:${profile.contact_email}`}
                                  className="text-primary hover:underline font-medium"
                                >
                                  {profile.contact_email}
                                </a>
                              </div>
                            )}
                            
                            {profile.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a 
                                  href={`tel:${profile.phone}`}
                                  className="text-primary hover:underline font-medium"
                                >
                                  {profile.phone}
                                </a>
                              </div>
                            )}
                            
                            {profile.website && (
                              <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <a 
                                  href={profile.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline font-medium"
                                >
                                  Site web
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Biographie */}
                        {profile.bio && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos</h3>
                            <p className="text-gray-700 leading-relaxed">
                              {profile.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Colonne de droite - Galerie photos (40%) */}
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Camera className="w-5 h-5" />
                          Galerie photos
                        </h3>
                        <ArtistPhotoPreview artistProfileId={profile.id} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isOwnProfile && isProfessional && (
                      <ContactArtistDialog 
                        artistId={profile.id}
                        artistName={profile.stage_name}
                        trigger={
                          <Button>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>
                        }
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Médias de l'artiste */}
          {id && (
            <div className="mb-8">
              <AirPlayer artistProfileId={id} />
            </div>
          )}

          {/* Répertoire */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Répertoire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RepertoireTab artistProfileId={profile.id} />
              </CardContent>
            </Card>
          </div>


        </div>
      </div>
    </Layout>
  );
};

export default ArtistProfile;
