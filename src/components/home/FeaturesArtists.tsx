import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, 
  User, 
  Calendar, 
  Eye, 
  MessageCircle, 
  BarChart3, 
  FileCheck 
} from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

const artistFeatures = [
  {
    icon: User,
    title: "Profil Artistique Complet",
    description: "Créez votre vitrine personnelle avec photos, vidéos, extraits audio et répertoire détaillé",
    color: "lyrical"
  },
  {
    icon: Calendar,
    title: "Gestion d'Agenda",
    description: "Organisez vos auditions, concerts et événements avec notre calendrier intégré",
    color: "gold"
  },
  {
    icon: Eye,
    title: "Visibilité Maximale",
    description: "Soyez découvert par les professionnels grâce à notre moteur de recherche avancé",
    color: "lyrical"
  },
  {
    icon: MessageCircle,
    title: "Communication Directe",
    description: "Échangez directement avec les directeurs artistiques et agents",
    color: "gold"
  },
  {
    icon: BarChart3,
    title: "Statistiques Détaillées",
    description: "Suivez les visites de votre profil et l'engagement de votre audience",
    color: "lyrical"
  },
  {
    icon: FileCheck,
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
        <div className="text-center mb-12">
          <div ref={sectionRef} className="text-appear">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold mb-4 leading-tight">Fonctionnalités pour les Artistes</h2>
            <p className="text-foreground/80 max-w-xl md:max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
              Développez votre carrière avec des outils professionnels de promotion et de networking
            </p>
          </div>
          <div className="mt-8">
            <Button className="bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white" asChild>
              <Link to="/auth">Créer mon profil artiste</Link>
            </Button>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {artistFeatures.map((feature, index) => {
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
                  <CardContent className="p-4 md:p-6 h-full flex flex-col text-center">
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
                      <h4 className="font-semibold text-xl md:text-2xl mb-3 text-foreground group-hover:text-primary transition-colors leading-tight">
                        {feature.title}
                      </h4>
                      <p className="text-foreground/70 text-base md:text-sm leading-relaxed">
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
          <Button className="bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white" asChild>
            <Link to="/auth">Créer mon profil artiste</Link>
          </Button>
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-16 md:mt-20 text-center bg-muted rounded-2xl p-6 md:p-12 text-appear">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold mb-4 leading-tight">
            Prêt à développer votre carrière ?
          </h3>
          <p className="text-foreground/80 mb-6 md:mb-8 max-w-xl md:max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Rejoignez plus de 400 artistes lyriques qui utilisent déjà Lyrisphere 
            pour développer leur visibilité et décrocher des opportunités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white" asChild>
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