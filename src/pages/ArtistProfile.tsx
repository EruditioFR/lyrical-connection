
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { ComposeMessage } from '@/components/messaging/ComposeMessage';
import { useIsMobile } from '@/hooks/use-mobile';
import ArtistBadges from '@/components/profile/ArtistBadges';
import JuryEvaluationPanel from '@/components/jury/JuryEvaluationPanel';


const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { artistProfile: currentUserProfile, isProfessional } = useUserType();
  const [showComposeMessage, setShowComposeMessage] = React.useState(false);
  const [selectedContestId, setSelectedContestId] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  // Fetch professional's contests for jury evaluation
  const { data: myContests } = useQuery({
    queryKey: ['my-contests-for-jury'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return [];

      const { data } = await supabase
        .from('professional_events')
        .select('id, title')
        .eq('professional_profile_id', profile.id)
        .eq('event_type', 'concours')
        .eq('status', 'published');

      return data || [];
    },
    enabled: isProfessional
  });

  // Get professional profile ID for jury panel
  const { data: professionalProfileId } = useQuery({
    queryKey: ['my-professional-profile-id'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return data?.id || null;
    },
    enabled: isProfessional
  });

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
          className={`${isMobile ? 'h-48' : 'h-64'} bg-gradient-to-r from-blue-600 to-purple-600 relative`}
          style={{
            backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>
          
          {/* Boutons d'action */}
          <div className={`absolute ${isMobile ? 'top-4 right-4' : 'top-6 right-6'} flex ${isMobile ? 'flex-row gap-2' : 'flex-col gap-3'}`}>
            {isOwnProfile && (
              <Button 
                variant="outline"
                size={isMobile ? "default" : "lg"}
                onClick={() => window.location.href = '/profil'}
                className="bg-white/95 text-gray-900 border-white/30 hover:bg-white hover:text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-300 font-semibold px-4"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isMobile ? 'Éditer' : 'Editer mon profil'}
              </Button>
            )}
            
            {/* Bouton Contact pour messagerie interne */}
            {!isOwnProfile && user && (
              <Button 
                size={isMobile ? "default" : "lg"}
                onClick={() => setShowComposeMessage(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-4"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isMobile ? 'Contact' : 'Contacter'}
              </Button>
            )}
          </div>
        </div>

        <div className={`container mx-auto px-4 ${isMobile ? '-mt-12' : '-mt-20'} relative z-10`}>
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-8">
            <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-start'} gap-6`}>
              {/* Avatar */}
              <div className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} border-4 border-white shadow-lg rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}>
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
                    <span className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
                      {getInitials(profile.stage_name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Info principale */}
              <div className="flex-1 w-full">
                <div className={`${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
                  <div className="w-full">
                    <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 mb-2`}>
                      {profile.stage_name}
                    </h1>
                    
                    {/* Badges */}
                    <ArtistBadges artistProfileId={profile.id} className="mb-3" />
                    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'} text-gray-600 mb-4`}>
                      {profile.voice_type && (
                        <Badge variant="secondary" className="text-sm w-fit">
                          {profile.voice_type}
                        </Badge>
                      )}
                      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-4'}`}>
                        {profile.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{profile.location}</span>
                          </div>
                        )}
                        {profile.birth_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">{calculateAge(profile.birth_date)} ans</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile: Actions buttons */}
                    {isMobile && (
                      <div className="flex gap-2 justify-center mb-6">
                        {!isOwnProfile && isProfessional && (
                          <Button size="sm" onClick={() => setShowComposeMessage(true)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contacter
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Layout responsif pour le contenu */}
                    <div className={`grid grid-cols-1 ${isMobile ? 'gap-6' : 'lg:grid-cols-5 gap-8'}`}>
                      {/* Informations et biographie */}
                      <div className={`${isMobile ? '' : 'lg:col-span-3'}`}>
                        {/* Informations supplémentaires */}
                        <div className={`mb-6 flex ${isMobile ? 'flex-col gap-3' : 'flex-wrap gap-6'}`}>
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

                        {/* Biographie */}
                        {profile.bio && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos</h3>
                            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                              {profile.bio}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Galerie photos - Desktop seulement, sur mobile elle sera dans une section séparée */}
                      {!isMobile && (
                        <div className="lg:col-span-2">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Galerie photos
                          </h3>
                          <ArtistPhotoPreview artistProfileId={profile.id} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Desktop */}
                  {!isMobile && (
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
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Galerie photos sur mobile - Section séparée */}
          {isMobile && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Galerie photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArtistPhotoPreview artistProfileId={profile.id} />
                </CardContent>
              </Card>
            </div>
          )}

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
              <CardContent className={isMobile ? 'p-4' : ''}>
                <RepertoireTab artistProfileId={profile.id} />
              </CardContent>
            </Card>
          </div>

          {/* Jury Evaluation Panel - Only for professionals with active contests */}
          {isProfessional && myContests && myContests.length > 0 && !isOwnProfile && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Évaluation Jury
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myContests.length === 1 ? (
                    <JuryEvaluationPanel
                      contestId={myContests[0].id}
                      artistProfileId={profile.id}
                      artistName={profile.stage_name}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {myContests.map(contest => (
                          <Button
                            key={contest.id}
                            variant={selectedContestId === contest.id ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedContestId(contest.id)}
                          >
                            {contest.title}
                          </Button>
                        ))}
                      </div>
                      {selectedContestId && (
                        <JuryEvaluationPanel
                          contestId={selectedContestId}
                          artistProfileId={profile.id}
                          artistName={profile.stage_name}
                        />
                      )}
                      {!selectedContestId && (
                        <p className="text-muted-foreground text-sm">
                          Sélectionnez un concours pour évaluer ce candidat.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>

      {/* Modale de composition de message */}
      {showComposeMessage && (
        <Dialog open={showComposeMessage} onOpenChange={setShowComposeMessage}>
          <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh] m-2' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
            <ComposeMessage
              recipientId={profile.user_id}
              recipientName={profile.stage_name}
              onClose={() => setShowComposeMessage(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default ArtistProfile;
