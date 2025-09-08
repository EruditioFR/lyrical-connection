
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, MapPin, Music } from 'lucide-react';

import { useArtists } from '@/hooks/useArtists';

const FeaturedArtists = () => {
  const { t } = useTranslation('home');
  
  
  // Récupérer les vrais artistes depuis la base de données
  const { artists, isLoading } = useArtists({});
  
  // Filtrer uniquement les artistes avec un forfait Premium Visibilité actif
  const premiumArtists = artists.filter(artist => 
    artist.public_visibility_premium && 
    artist.premium_subscription_end && 
    new Date(artist.premium_subscription_end) > new Date()
  );
  
  // Prendre les 4 premiers artistes premium
  const featuredArtists = premiumArtists.slice(0, 4).map(artist => ({
    id: artist.id,
    name: artist.stage_name,
    voiceType: artist.voice_type || 'Artiste lyrique',
    image: artist.profile_image_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    specialty: artist.bio ? artist.bio.substring(0, 50) + '...' : 'Artiste professionnel',
    location: artist.location || 'France',
    featured: true,
    profileViews: Math.floor(Math.random() * 1000) + 100 // TODO: Implémenter les vraies vues de profil
  }));

  if (isLoading) {
    return (
      <section className="bg-background py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div>
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-muted rounded-xl h-96"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Si aucun artiste, ne pas afficher la section
  if (featuredArtists.length === 0) {
    return null;
  }
  
  return (
    <section className="bg-background pt-4 pb-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">{t('featuredArtists.title')}</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {t('featuredArtists.subtitle')}
            </p>
          </div>
          <Button variant="link" className="flex items-center mt-4 md:mt-0" asChild>
            <Link to="/artistes">
              {t('featuredArtists.viewAll')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredArtists.map((artist, index) => (
            <div 
              key={artist.id}
              className="rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm"
            >
              <Link to={`/artistes/${artist.id}`} className="block relative aspect-[3/4] overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover"
                />
                
                {artist.featured && (
                  <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full">
                    {t('featuredArtists.featured')}
                  </div>
                )}
                
                {/* Profile stats overlay */}
                <div className="absolute top-3 left-3">
                  <div className="bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 text-white">
                    <Music className="h-3 w-3" />
                    <span className="text-xs font-medium">{artist.profileViews}</span>
                  </div>
                </div>
              </Link>
              
              <div className="p-4">
                <h3 className="font-serif font-semibold text-lg">
                  <Link to={`/artistes/${artist.id}`}>{artist.name}</Link>
                </h3>
                <p className="text-muted-foreground text-sm font-medium">{artist.voiceType}</p>
                <p className="text-xs text-muted-foreground mt-1">{artist.specialty}</p>
                
                <div className="flex items-center mt-3 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{artist.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Call to action section */}
        <div className="mt-16 bg-gradient-to-r from-lyrical-50 to-gold-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-serif font-semibold mb-4">
            {t('featuredArtists.becomeArtist.title')}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('featuredArtists.becomeArtist.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800 text-white"
              asChild
            >
              <Link to="/auth">{t('featuredArtists.becomeArtist.createProfile')}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide-artistes">{t('featuredArtists.becomeArtist.guide')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
