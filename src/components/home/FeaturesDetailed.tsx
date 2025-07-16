import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Music, Users, Calendar, Search, MessageSquare, Trophy, BarChart3, Settings, Mic, Globe, Heart, Zap } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';
const artistFeatures = [{
  icon: Music,
  title: "Profil Artistique Complet",
  description: "Créez votre vitrine personnelle avec photos, vidéos, extraits audio et répertoire détaillé",
  color: "lyrical"
}, {
  icon: Calendar,
  title: "Gestion d'Agenda",
  description: "Organisez vos auditions, concerts et événements avec notre calendrier intégré",
  color: "gold"
}, {
  icon: Search,
  title: "Visibilité Maximale",
  description: "Soyez découvert par les professionnels grâce à notre moteur de recherche avancé",
  color: "lyrical"
}, {
  icon: MessageSquare,
  title: "Communication Directe",
  description: "Échangez directement avec les directeurs artistiques et agents",
  color: "gold"
}, {
  icon: BarChart3,
  title: "Statistiques Détaillées",
  description: "Suivez les visites de votre profil et l'engagement de votre audience",
  color: "lyrical"
}, {
  icon: Trophy,
  title: "Candidatures Simplifiées",
  description: "Postulez aux auditions et concours en un clic avec votre profil pré-rempli",
  color: "gold"
}];
const professionalFeatures = [{
  icon: Users,
  title: "Base de Données Exclusive",
  description: "Accédez à plus de 500 profils d'artistes lyriques vérifiés et qualifiés",
  color: "lyrical"
}, {
  icon: Search,
  title: "Recherche Avancée",
  description: "Filtrez par tessiture, répertoire, expérience, localisation et disponibilité",
  color: "gold"
}, {
  icon: Calendar,
  title: "Gestion d'Événements",
  description: "Organisez auditions, masterclasses et spectacles avec gestion des inscriptions",
  color: "lyrical"
}, {
  icon: MessageSquare,
  title: "Communication Centralisée",
  description: "Gérez tous vos échanges avec les artistes depuis une interface unique",
  color: "gold"
}, {
  icon: Settings,
  title: "Outils de Casting",
  description: "Créez des appels à candidatures personnalisés et gérez les réponses efficacement",
  color: "lyrical"
}, {
  icon: BarChart3,
  title: "Tableau de Bord Pro",
  description: "Suivez vos statistiques, candidatures reçues et taux de réponse",
  color: "gold"
}];
const FeaturesDetailed = () => {
  const introRef = useAnimateOnScroll();
  const artistsSectionRef = useAnimateOnScroll();
  const professionalsSectionRef = useAnimateOnScroll();
  const ctaRef = useAnimateOnScroll();
  
  return <section className="py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Introduction */}
        <div ref={introRef} className="text-center max-w-4xl mx-auto mb-20 text-appear">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Une plateforme pensée pour tous les acteurs du lyrique
          </h2>
          <p className="text-lg text-muted-foreground">
            Découvrez comment Lyrisphere révolutionne la façon dont les artistes 
            et les professionnels interagissent dans le monde de l'opéra
          </p>
        </div>
        
        {/* Artistes Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-12">
            <div ref={artistsSectionRef} className="text-appear">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-lyrical-100 p-3 rounded-xl">
                  <Mic className="h-8 w-8 text-lyrical-700" />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold">Pour les Artistes</h3>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Développez votre carrière avec des outils professionnels de promotion et de networking
              </p>
            </div>
            <Button className="hidden md:flex bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800" asChild>
              <Link to="/auth">Créer mon profil artiste</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artistFeatures.map((feature, index) => {
              const FeatureCard = () => {
                const cardRef = useAnimateOnScroll();
                return (
                  <div 
                    ref={cardRef}
                    key={index} 
                    className="bg-card rounded-xl p-6 border border-border hover:border-lyrical-200 transition-all duration-300 hover:shadow-lg text-appear"
                  >
                    <div className={`bg-${feature.color}-100 p-3 rounded-xl w-fit mb-4`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-700`} />
                    </div>
                    <h4 className="font-serif font-semibold text-lg mb-3">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              };
              return <FeatureCard key={index} />;
            })}
          </div>
          
          <div className="md:hidden mt-8 text-center">
            <Button className="bg-gradient-to-r from-lyrical-600 to-lyrical-700 hover:from-lyrical-700 hover:to-lyrical-800" asChild>
              <Link to="/auth">Créer mon profil artiste</Link>
            </Button>
          </div>
        </div>
        
        {/* Professionals Section */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <div ref={professionalsSectionRef} className="text-appear">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gold-100 p-3 rounded-xl">
                  <Globe className="h-8 w-8 text-gold-700" />
                </div>
                <h3 className="text-2xl md:text-3xl font-serif font-bold">Pour les Professionnels</h3>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Trouvez les talents qui correspondent exactement à vos besoins artistiques
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex border-gold-200 hover:bg-gold-50" asChild>
              <Link to="/auth">Accéder à l'espace pro</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {professionalFeatures.map((feature, index) => {
              const ProfessionalFeatureCard = () => {
                const cardRef = useAnimateOnScroll();
                return (
                  <div 
                    ref={cardRef}
                    key={index} 
                    className="bg-card rounded-xl p-6 border border-border hover:border-gold-200 transition-all duration-300 hover:shadow-lg text-appear"
                  >
                    <div className={`bg-${feature.color}-100 p-3 rounded-xl w-fit mb-4`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-700`} />
                    </div>
                    <h4 className="font-serif font-semibold text-lg mb-3">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              };
              return <ProfessionalFeatureCard key={index} />;
            })}
          </div>
          
          <div className="md:hidden mt-8 text-center">
            <Button variant="outline" className="border-gold-200 hover:bg-gold-50" asChild>
              <Link to="/auth">Accéder à l'espace pro</Link>
            </Button>
          </div>
        </div>
        
        {/* Bottom CTA */}
        <div ref={ctaRef} className="mt-20 text-center bg-muted rounded-2xl p-12 text-appear">
          
          <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Rejoignez la communauté lyrique
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plus de 650 artistes et professionnels nous font déjà confiance. 
            Découvrez pourquoi Lyrisphere est devenu la référence du secteur.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600 text-white" asChild>
              <Link to="/auth">Commencer maintenant</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">En savoir plus</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>;
};
export default FeaturesDetailed;