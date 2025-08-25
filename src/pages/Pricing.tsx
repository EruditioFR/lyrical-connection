import Layout from "@/components/layout/Layout";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useUserType } from "@/hooks/useUserType";
import { Card, CardContent } from "@/components/ui/card";

export default function Pricing() {
  const { user } = useAuth();
  const { isArtist, isProfessional, isLoading: userTypeLoading } = useUserType();
  const { 
    plans, 
    plansLoading, 
    subscription, 
    createCheckoutSession 
  } = useSubscription();

  // Filter plans based on user type
  const getFilteredPlans = () => {
    // Filter out Early Bird from public display (admin-only plan)
    const basePlans = plans.filter(plan => plan.name !== 'Early Bird');
    
    // Add premium plan for artists
    const premiumArtistPlan = {
      id: 'premium-artist',
      name: 'Premium Artistes',
      description: 'Visibilité maximale avec toutes les fonctionnalités premium',
      price_monthly: 29,
      stripe_price_id: 'price_premium_artist', // Will be handled specially in the payment flow
      features: [
        'Toutes les fonctionnalités Artistes',
        'Visibilité premium avec badge',
        'Priorité dans les résultats de recherche',
        'Analytics avancées premium',
        'Support prioritaire VIP'
      ],
      limitations: {
        castings_per_month: 100,
        premium_features: true,
        premium_visibility: true
      },
      trial_days: 0,
      is_active: true,
      display_order: 3.5 // Between Artistes and Professionnels
    };

    if (!user) {
      // Not logged in: show base plans (no Early Bird, no premium)
      return basePlans;
    }
    
    if (userTypeLoading) {
      // Still loading user type: show base plans temporarily
      return basePlans;
    }

    if (isArtist) {
      // Artist: show Gratuit, Artistes, Premium Artistes
      const artistPlans = basePlans.filter(plan => 
        plan.name === 'Gratuit' || 
        plan.name === 'Artistes'
      );
      artistPlans.push(premiumArtistPlan);
      return artistPlans;
    }
    
    if (isProfessional) {
      // Professional: show Gratuit, Professionnels (no premium)
      return basePlans.filter(plan => 
        plan.name === 'Gratuit' || 
        plan.name === 'Professionnels'
      );
    }
    
    // No profile yet: show base plans (no premium)
    return basePlans;
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    // Handle premium artist plan specially - redirect to profile to add premium visibility
    if (planId === 'premium-artist') {
      // First check if user has a paid subscription
      if (!subscription || subscription.plan_id === 'gratuit') {
        // Need to get a paid plan first
        window.location.href = '/subscription';
        return;
      }
      // Redirect to profile to add premium visibility
      window.location.href = '/profile?tab=premium';
      return;
    }

    createCheckoutSession.mutate(planId);
  };

  if (plansLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Plans et Tarifs</h1>
            <p className="text-muted-foreground mt-2">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Plans et Tarifs</h1>
          <p className="text-muted-foreground mt-2">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {getFilteredPlans()
            .sort((a, b) => a.display_order - b.display_order)
            .map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={subscription?.plan_id === plan.id}
              onSelectPlan={handleSelectPlan}
              isLoading={createCheckoutSession.isPending}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          {isArtist && (
            <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">🌟 Plan Premium Artistes</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Le plan Premium Artistes (29€/mois) inclut toutes les fonctionnalités du plan Artistes 
                plus la visibilité premium avec badge, priorité dans les résultats et analytics avancées.
              </p>
              <p className="text-xs text-muted-foreground">
                Alternative : Vous pouvez aussi prendre le plan Artistes et ajouter la visibilité premium séparément depuis votre profil.
              </p>
            </div>
          )}
          
          {!isArtist && (
            <div className="mb-8 p-6 bg-muted/30 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">Option Visibilité Premium</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Les abonnés payants peuvent ajouter l'option Visibilité Premium (+29€/mois) 
                pour apparaître en priorité sur les pages publiques avec un badge premium.
              </p>
              <p className="text-xs text-muted-foreground">
                Disponible depuis votre profil une fois abonné à un plan payant.
              </p>
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Quelle est la différence entre les plans ?</h3>
              <p className="text-muted-foreground text-sm">
                Le plan Gratuit est sur invitation uniquement. 
                Le plan Artistes convient aux créateurs individuels, 
                le plan Professionnels aux institutions avec plus de fonctionnalités avancées.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Comment changer de plan ?</h3>
              <p className="text-muted-foreground text-sm">
                Vous pouvez changer de plan à tout moment depuis votre espace de gestion d'abonnement. 
                Les changements prennent effet immédiatement.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Comment annuler mon abonnement ?</h3>
              <p className="text-muted-foreground text-sm">
                Vous pouvez annuler votre abonnement à tout moment depuis le portail de gestion. 
                Votre accès restera actif jusqu'à la fin de la période payée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}