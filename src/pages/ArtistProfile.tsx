
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { PlayCircle, Music, Calendar, MapPin, Share2, Star, Facebook, Instagram, Youtube, Linkedin, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useArtistPhotos } from '@/hooks/useArtistPhotos';

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
}

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  
  // Récupérer les données de l'artiste depuis la base de données
  const { data: artist, isLoading, error } = useQuery({
    queryKey: ['artist-profile', id],
    queryFn: async () => {
      if (!id) throw new Error('ID artiste manquant');
      
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { photos, getPhotoUrl } = useArtistPhotos(id || '');

  // Si l'artiste n'existe pas ou erreur
  if (error || (!isLoading && !artist)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Artiste non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              L'artiste que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/artistes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste des artistes
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // État de chargement
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-serif font-bold mb-4">Chargement...</h1>
            <p className="text-muted-foreground">Récupération des informations de l'artiste...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Safely cast social_links to our interface
  const socialLinks = (artist.social_links as SocialLinks) || {};

  // Trouver les images
  const profilePhoto = photos?.find(photo => photo.is_profile_photo) || photos?.[0];
  const profileImageUrl = profilePhoto ? getPhotoUrl(profilePhoto.file_path) : artist.profile_image_url;
  const coverImageUrl = artist.cover_image_url || 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
  
  // Image par défaut si aucune photo
  const defaultImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80';

  return (
    <Layout>
      {/* En-tête de profil avec image de couverture */}
      <div className="relative">
        <div className="h-80 md:h-96 w-full">
          <div className="absolute inset-0">
            <img 
              src={coverImageUrl} 
              alt={`Couverture de ${artist.stage_name}`} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-16">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-background shadow-lg">
              <img 
                src={profileImageUrl || defaultImage} 
                alt={artist.stage_name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />
            </div>
            <div className="text-center md:text-left pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl md:text-4xl font-serif font-bold">{artist.stage_name}</h1>
                {artist.voice_type && (
                  <span className="inline-block bg-lyrical-100 text-lyrical-800 text-sm font-medium px-3 py-1 rounded-full">
                    {artist.voice_type}
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mt-1">
                {artist.voice_type && `${artist.voice_type} • `}
                {artist.location || 'France'}
              </p>
            </div>
            <div className="md:ml-auto flex space-x-3 pb-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Partager
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white">
                <Star className="h-4 w-4" />
                Suivre
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biographie */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-2xl font-serif font-semibold mb-4">Biographie</h2>
              <p className="text-muted-foreground">
                {artist.bio || "Cet artiste n'a pas encore ajouté de biographie."}
              </p>
            </section>

            {/* Galerie photos */}
            {photos && photos.length > 0 && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Galerie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="rounded-lg overflow-hidden group aspect-square">
                      <img 
                        src={getPhotoUrl(photo.file_path)} 
                        alt={photo.file_name} 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Répertoire */}
            {artist.repertoire && artist.repertoire.length > 0 && (
              <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-2xl font-serif font-semibold mb-4">Répertoire</h2>
                <div className="flex flex-wrap gap-2">
                  {artist.repertoire.map((item, index) => (
                    <span 
                      key={index} 
                      className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Barre latérale */}
          <div className="space-y-6">
            {/* Informations de contact */}
            <section className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h2 className="text-xl font-serif font-semibold mb-4">Informations</h2>
              <div className="space-y-4">
                {artist.voice_type && (
                  <div className="flex items-start">
                    <Music className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Type de voix</p>
                      <p className="font-medium">{artist.voice_type}</p>
                    </div>
                  </div>
                )}
                {artist.experience_years && artist.experience_years > 0 && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expérience</p>
                      <p className="font-medium">{artist.experience_years} an{artist.experience_years > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                )}
                {artist.location && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Localisation</p>
                      <p className="font-medium">{artist.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Réseaux sociaux si disponibles */}
              {socialLinks && Object.keys(socialLinks).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Réseaux sociaux</h3>
                  <div className="flex space-x-3">
                    {socialLinks.facebook && (
                      <a
                        href={socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                        aria-label="Facebook"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a
                        href={socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                        aria-label="Instagram"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {socialLinks.youtube && (
                      <a
                        href={socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                        aria-label="YouTube"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {socialLinks.linkedin && (
                      <a
                        href={socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-muted hover:bg-muted/80 transition-colors p-2 rounded-full"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Site web si disponible */}
              {artist.website && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={artist.website} target="_blank" rel="noopener noreferrer">
                      Visiter le site web
                    </a>
                  </Button>
                </div>
              )}
            </section>

            {/* Bouton de contact */}
            <div className="bg-gradient-to-r from-lyrical-600 to-gold-500 p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-serif font-semibold text-white mb-3">Vous êtes intéressé ?</h2>
              <p className="text-white/90 mb-4">Contactez cet artiste pour vos projets ou événements.</p>
              <Button className="w-full bg-white hover:bg-white/90 text-lyrical-900">
                Contacter l'artiste
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ArtistProfile;
