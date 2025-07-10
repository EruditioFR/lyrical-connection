import Layout from "@/components/layout/Layout";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

export default function Pricing() {
  const { user } = useAuth();
  const { 
    plans, 
    plansLoading, 
    subscription, 
    createCheckoutSession 
  } = useSubscription();

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

        {!user && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-4 text-center">
              <p className="text-blue-800">
                Connectez-vous pour souscrire à un plan et débloquer toutes les fonctionnalités.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
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
          <h2 className="text-2xl font-semibold mb-4">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Comment obtenir un compte gratuit ?</h3>
              <p className="text-muted-foreground text-sm">
                Les comptes gratuits sont accordés par les administrateurs selon des critères spécifiques. 
                Contactez-nous pour plus d'informations.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Qu'est-ce que le plan Early Bird ?</h3>
              <p className="text-muted-foreground text-sm">
                Le plan Early Bird est disponible pour certains utilisateurs gratuits qui souhaitent 
                passer à un plan payant après 6 mois d'utilisation.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Puis-je changer de plan ?</h3>
              <p className="text-muted-foreground text-sm">
                Oui, vous pouvez changer de plan à tout moment depuis votre espace de gestion d'abonnement. 
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