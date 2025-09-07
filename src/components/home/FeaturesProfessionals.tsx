import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Globe } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

// Import feature images
import databaseImg from '@/assets/features/database.png';
import advancedSearchImg from '@/assets/features/advanced-search.png';
import eventManagementImg from '@/assets/features/event-management.png';
import communicationImg from '@/assets/features/communication.png';
import castingToolsImg from '@/assets/features/casting-tools.png';
import proDashboardImg from '@/assets/features/pro-dashboard.png';

const professionalFeatures = [
  {
    image: databaseImg,
    title: "Base de Données Exclusive",
    description: "Accédez à plus de 500 profils d'artistes lyriques vérifiés et qualifiés",
    color: "lyrical"
  },
  {
    image: advancedSearchImg,
    title: "Recherche Avancée",
    description: "Filtrez par tessiture, répertoire, expérience, localisation et disponibilité",
    color: "gold"
  },
  {
    image: eventManagementImg,
    title: "Gestion d'Événements",
    description: "Organisez auditions, masterclasses et spectacles avec gestion des inscriptions",
    color: "lyrical"
  },
  {
    image: communicationImg,
    title: "Communication Centralisée",
    description: "Gérez tous vos échanges avec les artistes depuis une interface unique",
    color: "gold"
  },
  {
    image: castingToolsImg,
    title: "Outils de Casting",
    description: "Créez des appels à candidatures personnalisés et gérez les réponses efficacement",
    color: "lyrical"
  },
  {
    image: proDashboardImg,
    title: "Tableau de Bord Pro",
    description: "Suivez vos statistiques, candidatures reçues et taux de réponse",
    color: "gold"
  }
];

const FeaturesProfessionals = () => {
  const sectionRef = useAnimateOnScroll();
  const ctaRef = useAnimateOnScroll();

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div ref={sectionRef} className="text-appear">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gold-100 p-3 rounded-xl">
                <Globe className="h-8 w-8 text-gold-700" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold">Fonctionnalités pour Professionnels</h2>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Trouvez les talents qui correspondent exactement à vos besoins artistiques
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex border-gold-200 hover:bg-gold-50" asChild>
            <Link to="/auth">Accéder à l'espace pro</Link>
          </Button>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {professionalFeatures.map((feature, index) => {
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
          <Button variant="outline" className="border-gold-200 hover:bg-gold-50" asChild>
            <Link to="/auth">Accéder à l'espace pro</Link>
          </Button>
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-20 text-center bg-muted rounded-2xl p-12 text-appear">
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Optimisez votre recherche de talents
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plus de 250 professionnels utilisent déjà nos outils pour dénicher 
            les meilleurs artistes lyriques et organiser leurs événements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white" asChild>
              <Link to="/auth">Accéder à l'espace pro</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/professionnels">Voir des profils pros</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesProfessionals;