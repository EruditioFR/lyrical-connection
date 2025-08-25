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
    if (!user) {
      // Not logged in: show all plans
      return plans;
    }
    
    if (userTypeLoading) {
      // Still loading user type: show all plans temporarily
      return plans;
    }

    if (isArtist) {
      // Artist: show Gratuit, Early Bird, Artistes
      return plans.filter(plan => 
        plan.name === 'Gratuit' || 
        plan.name === 'Early Bird' || 
        plan.name === 'Artistes'
      );
    }
    
    if (isProfessional) {
      // Professional: show Gratuit, Early Bird, Professionnels
      return plans.filter(plan => 
        plan.name === 'Gratuit' || 
        plan.name === 'Early Bird' || 
        plan.name === 'Professionnels'
      );
    }
    
    // No profile yet: show all plans
    return plans;
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      window.location.href = '/auth';
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
          <div className="mb-8 p-6 bg-muted/30 rounded-lg max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Option Visibilité Premium</h3>
            <p className="text-muted-foreground text-sm mb-3">
              Tous les abonnés payants peuvent ajouter l'option Visibilité Premium (+29€/mois) 
              pour apparaître en priorité sur les pages publiques avec un badge premium.
            </p>
            <p className="text-xs text-muted-foreground">
              Disponible depuis votre profil une fois abonné à un plan payant.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Quelle est la différence entre les plans ?</h3>
              <p className="text-muted-foreground text-sm">
                Le plan Gratuit est sur invitation uniquement. Early Bird offre un tarif privilégié. 
                Artistes convient aux créateurs, Professionnels aux institutions avec plus de fonctionnalités.
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