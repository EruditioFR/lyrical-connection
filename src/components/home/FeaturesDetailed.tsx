import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Mic, Globe } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';

// Import feature images
import artistProfileImg from '@/assets/features/artist-profile.png';
import calendarManagementImg from '@/assets/features/calendar-management.png';
import searchVisibilityImg from '@/assets/features/search-visibility.png';
import communicationImg from '@/assets/features/communication.png';
import analyticsImg from '@/assets/features/analytics.png';
import applicationsImg from '@/assets/features/applications.png';
import databaseImg from '@/assets/features/database.png';
import advancedSearchImg from '@/assets/features/advanced-search.png';
import eventManagementImg from '@/assets/features/event-management.png';
import castingToolsImg from '@/assets/features/casting-tools.png';
import proDashboardImg from '@/assets/features/pro-dashboard.png';
const artistFeatures = [{
  image: artistProfileImg,
  title: "Profil Artistique Complet",
  description: "Créez votre vitrine personnelle avec photos, vidéos, extraits audio et répertoire détaillé",
  color: "lyrical"
}, {
  image: calendarManagementImg,
  title: "Gestion d'Agenda",
  description: "Organisez vos auditions, concerts et événements avec notre calendrier intégré",
  color: "gold"
}, {
  image: searchVisibilityImg,
  title: "Visibilité Maximale",
  description: "Soyez découvert par les professionnels grâce à notre moteur de recherche avancé",
  color: "lyrical"
}, {
  image: communicationImg,
  title: "Communication Directe",
  description: "Échangez directement avec les directeurs artistiques et agents",
  color: "gold"
}, {
  image: analyticsImg,
  title: "Statistiques Détaillées",
  description: "Suivez les visites de votre profil et l'engagement de votre audience",
  color: "lyrical"
}, {
  image: applicationsImg,
  title: "Candidatures Simplifiées",
  description: "Postulez aux auditions et concours en un clic avec votre profil pré-rempli",
  color: "gold"
}];
const professionalFeatures = [{
  image: databaseImg,
  title: "Base de Données Exclusive",
  description: "Accédez à plus de 500 profils d'artistes lyriques vérifiés et qualifiés",
  color: "lyrical"
}, {
  image: advancedSearchImg,
  title: "Recherche Avancée",
  description: "Filtrez par tessiture, répertoire, expérience, localisation et disponibilité",
  color: "gold"
}, {
  image: eventManagementImg,
  title: "Gestion d'Événements",
  description: "Organisez auditions, masterclasses et spectacles avec gestion des inscriptions",
  color: "lyrical"
}, {
  image: communicationImg,
  title: "Communication Centralisée",
  description: "Gérez tous vos échanges avec les artistes depuis une interface unique",
  color: "gold"
}, {
  image: castingToolsImg,
  title: "Outils de Casting",
  description: "Créez des appels à candidatures personnalisés et gérez les réponses efficacement",
  color: "lyrical"
}, {
  image: proDashboardImg,
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
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Une plateforme pensée
pour tous les acteurs du lyrique</h2>
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
              return <div ref={cardRef} key={index} className="bg-card rounded-xl p-6 border border-border">
                    <div className="w-16 h-16 mb-4 rounded-xl overflow-hidden">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif font-semibold text-lg mb-3">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>;
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
              return <div ref={cardRef} key={index} className="bg-card rounded-xl p-6 border border-border">
                    <div className="w-16 h-16 mb-4 rounded-xl overflow-hidden">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-serif font-semibold text-lg mb-3">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>;
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