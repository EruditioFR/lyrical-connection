
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from 'lucide-react';

// Données exemple pour les artistes en vedette
const featuredArtists = [
  {
    id: '1',
    name: 'Sophia Laurent',
    voiceType: 'Soprano',
    image: 'https://images.unsplash.com/photo-1516307343428-2c5675a99540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra classique',
    featured: true
  },
  {
    id: '2',
    name: 'Alexandre Dupont',
    voiceType: 'Ténor',
    image: 'https://images.unsplash.com/photo-1552642986-ccb41e7059e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra romantique',
    featured: true
  },
  {
    id: '3',
    name: 'Isabelle Moreau',
    voiceType: 'Mezzo-soprano',
    image: 'https://images.unsplash.com/photo-1553267751-1c148a7280a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra baroque',
    featured: false
  },
  {
    id: '4',
    name: 'Jean-Michel Bernard',
    voiceType: 'Baryton',
    image: 'https://images.unsplash.com/photo-1591803272481-8ad15505830e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
    specialty: 'Opéra contemporain',
    featured: false
  }
];

const FeaturedArtists = () => {
  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="text-appear">
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
              <div className="relative aspect-[3/4] overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <Button 
                    size="sm" 
                    className="mb-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white gap-2"
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
              </div>
              <div className="p-4">
                <h3 className="font-serif font-semibold text-lg hover:text-lyrical-700 transition-colors">
                  <Link to={`/artistes/${artist.id}`}>{artist.name}</Link>
                </h3>
                <p className="text-muted-foreground text-sm">{artist.voiceType}</p>
                <p className="text-xs text-muted-foreground mt-2">{artist.specialty}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;
