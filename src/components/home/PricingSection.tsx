import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Check, Star, Crown, Zap } from 'lucide-react';
import { useAnimateOnScroll } from '@/hooks/useIntersectionObserver';
const plans = [{
  name: "Artistes",
  price: "9",
  period: "mois",
  description: "Pour les artistes qui veulent maximiser leur visibilité",
  features: ["Profil artistique complet", "Upload illimité audio/vidéo", "Statistiques détaillées", "Réponse prioritaire aux castings", "Badge 'Artiste Vérifié'", "Support client prioritaire"],
  popular: false,
  cta: "Devenir Premium",
  icon: Star,
  gradient: "from-lyrical-600 to-lyrical-700"
}, {
  name: "Professionnel",
  price: "49",
  period: "mois",
  description: "Pour les professionnels en quête de talents",
  features: ["Accès complet à la base d'artistes", "Recherche avancée illimitée", "Création d'événements et castings", "Messagerie directe avec artistes", "Outils de gestion de candidatures", "Tableau de bord analytique", "Support dédié"],
  popular: true,
  cta: "Accéder à l'espace Pro",
  icon: Crown,
  gradient: "from-gold-500 to-gold-600"
}];
const PricingSection = () => {
  const headerRef = useAnimateOnScroll();
  const bottomRef = useAnimateOnScroll();
  
  return <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 text-appear">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-lyrical-100/80 text-lyrical-700 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Tarifs transparents
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Choisissez le plan qui vous correspond
          </h2>
          <p className="text-lg text-muted-foreground">
            Des tarifs adaptés à vos besoins, que vous soyez artiste ou professionnel
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const PricingCard = () => {
              const cardRef = useAnimateOnScroll();
              return (
                <div 
                  ref={cardRef}
                  key={plan.name} 
                  className={`relative bg-card rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-xl text-appear ${plan.popular ? 'border-gold-200 shadow-lg scale-105' : 'border-border hover:border-lyrical-200'}`}
                >
              {/* Popular Badge */}
              {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  
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
              <Button className={`w-full py-6 text-lg font-medium bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white`} asChild>
                <Link to="/pricing">{plan.cta}</Link>
              </Button>

              {/* Additional Info */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Sans engagement • Résiliation à tout moment
              </p>
                </div>
              );
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