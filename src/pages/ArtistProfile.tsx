import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Globe, Mail, Phone, User, Music, Camera, MessageCircle, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import PhotosTab from '@/components/profile/PhotosTab';
import AudioTab from '@/components/profile/AudioTab';
import RepertoireTab from '@/components/profile/RepertoireTab';
import ContactArtistDialog from '@/components/artists/ContactArtistDialog';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';
const ArtistProfile = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    user
  } = useAuth();
  const {
    artistProfile: currentUserProfile,
    isProfessional
  } = useUserType();
  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: ['artist-profile-public', id],
    queryFn: async () => {
      if (!id) throw new Error('ID manquant');
      const {
        data,
        error
      } = await supabase.from('artist_profiles').select('*').eq('id', id).eq('is_active', true).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Récupérer les photos pour obtenir la photo de profil
  const {
    photos,
    getPhotoUrl
  } = useArtistPhotos(id);
  const profilePhoto = photos?.find(photo => photo.is_profile_photo);

  // Si l'utilisateur connecté est un artiste et qu'il consulte son propre profil
  const isOwnProfile = user && currentUserProfile?.id === id;
  if (isLoading) {
    return <Layout>
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
      </Layout>;
  }
  if (error || !profile) {
    return <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil non trouvé</h1>
          <p className="text-gray-600">Ce profil d'artiste n'existe pas ou n'est plus actif.</p>
          <Button onClick={() => window.history.back()} variant="outline" className="mt-4">
            Retour
          </Button>
        </div>
      </Layout>;
  }
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) {
      age--;
    }
    return age;
  };

  // Utiliser la photo de profil de la galerie ou l'ancienne URL en fallback
  const avatarImageSrc = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : profile.profile_image_url;
  return <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative" style={{
        backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="container mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-start gap-6">
              {/* Avatar avec AspectRatio pour éviter la déformation */}
              <div className="w-32 h-32 border-4 border-white shadow-lg rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                {avatarImageSrc ? <AspectRatio ratio={1}>
                    <img src={avatarImageSrc} alt={profile.stage_name} className="w-full h-full object-cover" />
                  </AspectRatio> : <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                    <span className="text-2xl font-bold">
                      {getInitials(profile.stage_name)}
                    </span>
                  </div>}
              </div>

              {/* Info principale */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile.stage_name}
                    </h1>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      {profile.voice_type && <Badge variant="secondary" className="text-sm">
                          {profile.voice_type}
                        </Badge>}
                      {profile.location && <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>}
                      {profile.birth_date && <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{calculateAge(profile.birth_date)} ans</span>
                        </div>}
                    </div>

                    {profile.bio && <p className="text-gray-700 max-w-2xl">
                        {profile.bio}
                      </p>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isOwnProfile && <Button variant="outline" onClick={() => window.location.href = '/profil'}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>}
                    
                    {!isOwnProfile && isProfessional && <ContactArtistDialog artistId={profile.id} artistName={profile.stage_name} trigger={<Button>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.experience_years !== null && <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{profile.experience_years}</div>
                  <div className="text-sm text-gray-600">Années d'expérience</div>
                </div>}
              
              {profile.nationality && <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800">{profile.nationality}</div>
                  <div className="text-sm text-gray-600">Nationalité</div>
                </div>}
              
              {profile.spoken_languages && profile.spoken_languages.length > 0 && <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-800">
                    {profile.spoken_languages.join(', ')}
                  </div>
                  <div className="text-sm text-gray-600">Langues parlées</div>
                </div>}
            </div>
          </div>

          {/* Contenu en onglets */}
          <Tabs defaultValue="repertoire" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="repertoire">
                <Music className="w-4 h-4 mr-2" />
                Répertoire
              </TabsTrigger>
              <TabsTrigger value="photos">
                <Camera className="w-4 h-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="audio">
                <User className="w-4 h-4 mr-2" />
                Audio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="repertoire" className="mt-6">
              <RepertoireTab artistProfileId={profile.id} />
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <PhotosTab artistProfileId={profile.id} />
            </TabsContent>

            <TabsContent value="audio" className="mt-6">
              <AudioTab artistProfileId={profile.id} />
            </TabsContent>
          </Tabs>

          {/* Contact et liens */}
          {(profile.contact_email || profile.phone || profile.website) && <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.contact_email && <div className="flex items-center gap-2">
                    
                    <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline">
                      {profile.contact_email}
                    </a>
                  </div>}
                
                {profile.phone && <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a href={`tel:${profile.phone}`} className="text-primary hover:underline">
                      {profile.phone}
                    </a>
                  </div>}
                
                {profile.website && <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Site web
                    </a>
                  </div>}
              </CardContent>
            </Card>}
        </div>
      </div>
    </Layout>;
};
export default ArtistProfile;