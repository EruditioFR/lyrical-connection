
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search, Music, Calendar, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-b from-background to-muted overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
            Découvrez les <span className="bg-clip-text text-transparent bg-gradient-to-r from-lyrical-700 to-gold-500">talents lyriques</span> de demain
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Une plateforme exclusive dédiée à la promotion des jeunes chanteurs lyriques auprès des professionnels et du grand public.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button 
              className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white"
              asChild
            >
              <Link to="/artistes">
                Découvrir les artistes
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-lg"
              asChild
            >
              <Link to="/evenements">
                Explorer les événements
              </Link>
            </Button>
          </div>
          
          <div className="relative max-w-lg mx-auto mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-lyrical-200/20 to-gold-200/20 rounded-lg blur"></div>
            <div className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-lg p-1">
              <div className="flex items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher un artiste, un événement..."
                    className="w-full pl-10 pr-4 py-3 bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                </div>
                <Button className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white">
                  Rechercher
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 text-center shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Music className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">Artistes Talentueux</h3>
            <p className="text-muted-foreground">Découvrez des chanteurs lyriques exceptionnels et suivez leur parcours artistique.</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 text-center shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">Événements Exclusifs</h3>
            <p className="text-muted-foreground">Participez à des concerts, auditions et rencontres professionnelles de qualité.</p>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 text-center shadow-sm border border-border/50 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="bg-lyrical-100 text-lyrical-700 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">Communauté Passionnée</h3>
            <p className="text-muted-foreground">Rejoignez une communauté d'artistes et de professionnels partageant la même passion.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
