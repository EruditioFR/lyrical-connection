import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Music, Users, TrendingUp, ArrowRight } from 'lucide-react';

const HeroModern = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('/lovable-uploads/b68db290-37e4-4a2d-bfeb-ef949fb2dd4b.png')] bg-cover bg-center opacity-10"></div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-lyrical-50/50 via-transparent to-gold-50/30"></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-screen">
          {/* Left Content */}
          <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left animate-fade-in pt-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-lyrical-100/80 text-lyrical-700 text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              La plateforme leader de la musique lyrique
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              Connectez les <span className="bg-clip-text text-transparent bg-gradient-to-r from-lyrical-600 to-gold-500">talents lyriques</span> aux opportunités
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              La première plateforme dédiée aux chanteurs lyriques et aux professionnels de l'opéra. 
              Créez votre profil, découvrez des opportunités et développez votre carrière.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white shadow-lg"
                asChild
              >
                <Link to="/auth">
                  Créer mon profil
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg border-2 hover:bg-muted"
                asChild
              >
                <Link to="/artistes">Découvrir les artistes</Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">500+</div>
                <div className="text-sm text-muted-foreground">Artistes</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">150+</div>
                <div className="text-sm text-muted-foreground">Professionnels</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-lyrical-700">200+</div>
                <div className="text-sm text-muted-foreground">Événements</div>
              </div>
            </div>
          </div>
          
          {/* Right Content */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 animate-fade-in pb-20" style={{ animationDelay: '200ms' }}>
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1507901747481-84a4f64ffd7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                  alt="Performance d'opéra"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-lyrical-900/40 to-transparent"></div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -left-6 top-1/4 bg-card rounded-xl p-4 shadow-lg border animate-scale-in" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center space-x-3">
                  <div className="bg-lyrical-100 p-2 rounded-lg">
                    <Music className="h-5 w-5 text-lyrical-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Profils Complets</div>
                    <div className="text-xs text-muted-foreground">Audio, vidéo, répertoire</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-6 bottom-1/4 bg-card rounded-xl p-4 shadow-lg border animate-scale-in" style={{ animationDelay: '600ms' }}>
                <div className="flex items-center space-x-3">
                  <div className="bg-gold-100 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-gold-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Réseau Pro</div>
                    <div className="text-xs text-muted-foreground">Directeurs, agents</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroModern;