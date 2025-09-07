import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Mic } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

// Import feature images
import artistProfileImg from '@/assets/features/artist-profile.png';
import calendarManagementImg from '@/assets/features/calendar-management.png';
import searchVisibilityImg from '@/assets/features/search-visibility.png';
import communicationImg from '@/assets/features/communication.png';
import analyticsImg from '@/assets/features/analytics.png';
import applicationsImg from '@/assets/features/applications.png';

const artistFeatures = [
  {
    image: artistProfileImg,
    title: "Profil Artistique Complet",
    description: "Créez votre vitrine personnelle avec photos, vidéos, extraits audio et répertoire détaillé",
    color: "lyrical"
  },
  {
    image: calendarManagementImg,
    title: "Gestion d'Agenda",
    description: "Organisez vos auditions, concerts et événements avec notre calendrier intégré",
    color: "gold"
  },
  {
    image: searchVisibilityImg,
    title: "Visibilité Maximale",
    description: "Soyez découvert par les professionnels grâce à notre moteur de recherche avancé",
    color: "lyrical"
  },
  {
    image: communicationImg,
    title: "Communication Directe",
    description: "Échangez directement avec les directeurs artistiques et agents",
    color: "gold"
  },
  {
    image: analyticsImg,
    title: "Statistiques Détaillées",
    description: "Suivez les visites de votre profil et l'engagement de votre audience",
    color: "lyrical"
  },
  {
    image: applicationsImg,
    title: "Candidatures Simplifiées",
    description: "Postulez aux auditions et concours en un clic avec votre profil pré-rempli",
    color: "gold"
  }
];

const FeaturesArtists = () => {
  const sectionRef = useAnimateOnScroll();
  const ctaRef = useAnimateOnScroll();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div ref={sectionRef} className="text-appear">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-lyrical-100 p-3 rounded-xl">
                <Mic className="h-8 w-8 text-lyrical-700" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">Fonctionnalités pour Artistes</h2>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Développez votre carrière avec des outils professionnels de promotion et de networking
            </p>
          </div>
          <Button className="hidden md:flex bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800" asChild>
            <Link to="/auth">Créer mon profil artiste</Link>
          </Button>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artistFeatures.map((feature, index) => {
            const FeatureCard = () => {
              const cardRef = useAnimateOnScroll();
              return (
                <div 
                  ref={cardRef} 
                  key={index} 
                  className="relative h-40 md:h-48 lg:h-56 rounded-lg overflow-hidden shadow-md transition-shadow duration-300 ease-out text-appear"
                  style={{
                    backgroundImage: `url(${feature.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  aria-label={feature.title}
                >
                  {/* Neutral Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h4 className="font-semibold text-base mb-2 text-white">{feature.title}</h4>
                    <p className="text-white text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            };
            return <FeatureCard key={index} />;
          })}
        </div>
        
        {/* Mobile CTA */}
        <div className="md:hidden mt-8 text-center">
          <Button className="bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800" asChild>
            <Link to="/auth">Créer mon profil artiste</Link>
          </Button>
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-20 text-center bg-muted rounded-2xl p-12 text-appear">
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Prêt à développer votre carrière ?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez plus de 400 artistes lyriques qui utilisent déjà Lyrisphere 
            pour développer leur visibilité et décrocher des opportunités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800 text-white" asChild>
              <Link to="/auth">Créer mon profil gratuit</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/artistes">Voir des profils d'artistes</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesArtists;