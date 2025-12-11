import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, Plus } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';
import { useUserType } from '@/hooks/useUserType';
import { usePremiumVisibility } from '@/hooks/usePremiumVisibility';
import { useAuth } from '@/hooks/useAuth';
const allPlans = [{
  name: "Artistes",
  price: "9",
  period: "mois",
  description: "Pour les artistes qui veulent maximiser leur visibilité",
  features: ["Profil artistique complet", "Upload illimité audio/vidéo", "Statistiques détaillées", "Accès au support client"],
  popular: false,
  cta: "Devenir Premium",
  icon: Star,
  gradient: "from-lyrical-600 to-lyrical-700",
  userType: "artist"
}, {
  name: "Premium Visibilité",
  price: "29",
  period: "mois",
  description: "Add-on pour apparaître sur les pages publiques",
  features: ["Visible par les visiteurs non connectés", "Apparaît dans les pages publiques", "Priorité dans les résultats de recherche", "Badge premium sur votre profil", "Boost de visibilité", "Analytics premium"],
  popular: true,
  cta: "Activer la visibilité premium",
  icon: Crown,
  gradient: "from-amber-600 to-amber-700",
  userType: "artist",
  isPremiumAddon: true
}, {
  name: "Professionnel",
  price: "49",
  period: "mois",
  description: "Pour les professionnels en quête de talents",
  features: ["Accès complet à la base d'artistes", "Recherche avancée illimitée", "Création d'événements et castings", "Messagerie directe avec artistes", "Outils de gestion de candidatures", "Tableau de bord analytique", "Support dédié"],
  popular: false,
  cta: "Accéder à l'espace Pro",
  icon: Crown,
  gradient: "from-gold-500 to-gold-600",
  userType: "professional"
}];
interface PricingSectionProps {
  selectedUserType?: 'artist' | 'professional' | null;
}
const PricingSection = ({
  selectedUserType
}: PricingSectionProps) => {
  const headerRef = useAnimateOnScroll();
  const bottomRef = useAnimateOnScroll();
  const {
    userType,
    isProfessional,
    artistProfile
  } = useUserType();
  const {
    createPremium,
    isCreatingPremium
  } = usePremiumVisibility();
  const {
    user
  } = useAuth();

  // Filter plans based on selected user type or authenticated user type
  const getFilteredPlans = () => {
    // If a user type is selected on homepage, filter by that
    if (selectedUserType) {
      return allPlans.filter(plan => plan.userType === selectedUserType);
    }

    // Otherwise use the existing logic for authenticated users
    if (isProfessional) {
      // Professionals only see their plan
      return allPlans.filter(plan => plan.userType === "professional");
    }
    // Artists and unknown users see all plans
    return allPlans;
  };
  const plans = getFilteredPlans();

  // Handle premium visibility subscription
  const handlePremiumVisibility = () => {
    if (!user || !artistProfile) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
      return;
    }
    createPremium({
      profileType: 'artist',
      profileId: artistProfile.id
    });
  };
  return <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 text-appear">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-lyrical-100/80 text-lyrical-700 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Tarifs
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Choisissez le plan qui vous correspond
          </h2>
          <p className="text-lg text-muted-foreground">Des tarifs adaptés à vos besoins</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
          const PricingCard = () => {
            const cardRef = useAnimateOnScroll();
            return <div ref={cardRef} key={plan.name} className={`relative bg-card rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl text-appear ${plan.popular ? 'border-gold-200 shadow-lg scale-105' : 'border-border hover:border-lyrical-200'} ${plan.isPremiumAddon ? 'border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30' : ''}`}>
              {/* Popular Badge */}
              {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                    ✨ Recommandé
                  </Badge>
                </div>}

              {/* Premium Add-on Badge */}
              {plan.isPremiumAddon && <div className="absolute -top-3 right-6">
                  <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-100">
                    <Plus className="h-3 w-3 mr-1" />
                    Add-on
                  </Badge>
                </div>}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.gradient} mb-4`}>
                  <plan.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-4xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground">/ {plan.period}</span>
                </div>
                
                {plan.isPremiumAddon && <p className="text-xs text-amber-600 mt-2">
                    En complément de votre abonnement principal
                  </p>}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => <div key={featureIndex} className="flex items-start space-x-3">
                    <div className={`mt-1 p-1 rounded-full bg-gradient-to-r ${plan.gradient}`}>
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>)}
              </div>

              {/* CTA */}
              {plan.isPremiumAddon ? <Button onClick={handlePremiumVisibility} disabled={isCreatingPremium} className={`w-full py-6 text-lg font-medium bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`}>
                  {isCreatingPremium ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Activation...
                    </> : plan.cta}
                </Button> : <Button className={`w-full py-6 text-lg font-medium bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`} asChild>
                  <Link to="/pricing">{plan.cta}</Link>
                </Button>}

              {/* Additional Info */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Sans engagement • Résiliation à tout moment
              </p>
                </div>;
          };
          return <PricingCard key={index} />;
        })}
        </div>

        {/* Bottom Info */}
        <div ref={bottomRef} className="text-center mt-16 text-appear">
          <div className="bg-card rounded-xl border p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-serif font-semibold mb-4">
              Vous hésitez encore ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Contactez notre équipe pour découvrir comment Lyrisphere peut 
              vous aider à développer votre carrière ou trouver les talents que vous recherchez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/contact">Nous contacter</Link>
              </Button>
              <Button variant="link" asChild>
                <Link to="/faq">Questions fréquentes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default PricingSection;