import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, MapPin, Music } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

// Données exemple pour les artistes en vedette
const featuredArtists = [
  {
    id: '1',
    name: 'Sophia Laurent',
    voiceType: 'Soprano',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    specialty: 'Opéra classique',
    location: 'Paris, France',
    featured: true,
    profileViews: 1248
  },
  {
    id: '2',
    name: 'Alexandre Dupont',
    voiceType: 'Ténor',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    specialty: 'Opéra romantique',
    location: 'Lyon, France',
    featured: true,
    profileViews: 956
  },
  {
    id: '3',
    name: 'Isabelle Moreau',
    voiceType: 'Mezzo-soprano',
    image: 'https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    specialty: 'Opéra baroque',
    location: 'Bordeaux, France',
    featured: false,
    profileViews: 742
  },
  {
    id: '4',
    name: 'Jean-Michel Bernard',
    voiceType: 'Baryton',
    image: 'https://images.unsplash.com/photo-1552642986-ccb41e7059e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    specialty: 'Opéra contemporain',
    location: 'Toulouse, France',
    featured: false,
    profileViews: 623
  }
];

const FeaturedArtists = () => {
  const titleRef = useAnimateOnScroll();
  
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div ref={titleRef} className="text-appear">
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Artistes en vedette</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Découvrez les artistes lyriques les plus prometteurs de notre plateforme.
            </p>
          </div>
          <Button variant="link" className="flex items-center mt-4 md:mt-0" asChild>
            <Link to="/artistes">
              Voir tous les artistes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {featuredArtists.map((artist, index) => (
            <div 
              key={artist.id}
              className={`group rounded-xl overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border text-appear`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link to={`/artistes/${artist.id}`} className="block relative aspect-[3/4] overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <Button 
                    size="sm" 
                    className="mb-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white gap-2 border-white/30"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Écouter
                  </Button>
                </div>
                
                {artist.featured && (
                  <div className="absolute top-3 right-3 bg-gold-500/90 text-white text-xs font-medium py-1 px-2 rounded-full">
                    En vedette
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
                <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
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
        <div className="mt-16 bg-gradient-to-r from-lyrical-50 to-gold-50 rounded-xl p-8 text-center animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h3 className="text-xl font-serif font-semibold mb-4">
            Vous êtes artiste lyrique ?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez notre communauté d'artistes et mettez en valeur votre talent 
            auprès de professionnels du milieu lyrique.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800 text-white"
              asChild
            >
              <Link to="/auth">Créer mon profil</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/guide-artistes">Guide pour les artistes</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;