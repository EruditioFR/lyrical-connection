import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Database, 
  Search, 
  Calendar, 
  MessageSquare, 
  Users, 
  Activity 
} from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

const professionalFeatures = [
  {
    icon: Database,
    title: "Base de Données Exclusive",
    description: "Accédez à plus de 500 profils d'artistes lyriques vérifiés et qualifiés",
    color: "lyrical"
  },
  {
    icon: Search,
    title: "Recherche Avancée",
    description: "Filtrez par tessiture, répertoire, expérience, localisation et disponibilité",
    color: "gold"
  },
  {
    icon: Calendar,
    title: "Gestion d'Événements",
    description: "Organisez auditions, masterclasses et spectacles avec gestion des inscriptions",
    color: "lyrical"
  },
  {
    icon: MessageSquare,
    title: "Communication Centralisée",
    description: "Gérez tous vos échanges avec les artistes depuis une interface unique",
    color: "gold"
  },
  {
    icon: Users,
    title: "Outils de Casting",
    description: "Créez des appels à candidatures personnalisés et gérez les réponses efficacement",
    color: "lyrical"
  },
  {
    icon: Activity,
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
        <div className="text-center mb-12">
          <div ref={sectionRef} className="text-appear">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4">Fonctionnalités pour les Professionnels</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Trouvez les talents qui correspondent exactement à vos besoins artistiques
            </p>
          </div>
          <div className="mt-8">
            <Button variant="outline" className="border-gold-200 hover:bg-gold-50" asChild>
              <Link to="/auth">Accéder à l'espace pro</Link>
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionalFeatures.map((feature, index) => {
            const FeatureCard = () => {
              const cardRef = useAnimateOnScroll();
              const IconComponent = feature.icon;
              const isLyrical = feature.color === "lyrical";
              
              return (
                <Card 
                  ref={cardRef} 
                  key={index} 
                  className="h-full hover:shadow-lg transition-all duration-300 ease-out text-appear border-border/50 hover:border-border group"
                >
                  <CardContent className="p-6 h-full flex flex-col text-center">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto ${
                      isLyrical 
                        ? "bg-gradient-to-br from-lyrical-100 to-lyrical-200 group-hover:from-lyrical-200 group-hover:to-lyrical-300" 
                        : "bg-gradient-to-br from-gold-100 to-gold-200 group-hover:from-gold-200 group-hover:to-gold-300"
                    }`}>
                      <IconComponent className={`h-6 w-6 ${
                        isLyrical ? "text-lyrical-700" : "text-gold-700"
                      }`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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