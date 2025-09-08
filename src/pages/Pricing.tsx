import Layout from "@/components/layout/Layout";
import { PricingCard } from "@/components/subscription/PricingCard";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useUserType } from "@/hooks/useUserType";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, User, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Pricing() {
  const { user, hasActiveSubscription } = useAuth();
  const { isArtist, isProfessional, isLoading: userTypeLoading } = useUserType();
  const { 
    plans, 
    plansLoading, 
    subscription, 
    createCheckoutSession 
  } = useSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState<'artist' | 'professional'>('artist');
  
  const source = searchParams.get('source');
  const userTypeParam = searchParams.get('type');
  const isPostRegistration = source === 'login' || source === 'signup';
  const isRequired = source === 'required';

  // Rediriger les utilisateurs avec abonnement actif vers le dashboard
  useEffect(() => {
    if (user && hasActiveSubscription && !isRequired) {
      console.log('Utilisateur avec abonnement actif, redirection vers dashboard');
      navigate('/dashboard');
    }
  }, [user, hasActiveSubscription, isRequired, navigate]);

  // Filter plans based on toggle selection only
  const getFilteredPlans = () => {
    // Filter out Early Bird and Gratuit from public display (admin-only plans)
    const basePlans = plans.filter(plan => plan.name !== 'Early Bird' && plan.name !== 'Gratuit');
    
    console.log('=== PRICING FILTER (SIMPLIFIED) ===');
    console.log('selectedUserType:', selectedUserType);

    if (selectedUserType === 'artist') {
      console.log('Toggle: Showing artist plans');
      return basePlans.filter(plan => 
        plan.name === 'Artistes' || plan.name === 'Premium Visibilité'
      );
    }
    
    if (selectedUserType === 'professional') {
      console.log('Toggle: Showing professional plans');
      return basePlans.filter(plan => 
        plan.name === 'Professionnels'
      );
    }

    // Default fallback (should not happen with toggle)
    console.log('Fallback: Showing artist plans');
    return basePlans.filter(plan => 
      plan.name === 'Artistes' || plan.name === 'Premium Visibilité'
    );
  };

  const handleSelectPlan = async (planId: string) => {
    console.log('=== HANDLE SELECT PLAN ===');
    console.log('Plan ID:', planId);
    console.log('User:', user);
    console.log('Subscription:', subscription);
    
    if (!user) {
      console.log('No user, redirecting to auth');
      window.location.href = '/auth';
      return;
    }

    // Handle premium artist plan specially
    if (planId === 'premium-artist') {
      console.log('Premium artist plan selected');
      
      // If user already has a paid subscription, add premium visibility
      if (subscription && subscription.plan_id !== 'gratuit') {
        console.log('User has paid subscription, redirecting to profile for premium visibility');
        window.location.href = '/profile?tab=premium';
        return;
      }
      
      // No paid subscription - find the Premium Visibilité plan and subscribe directly
      const premiumVisibilityPlan = plans?.find(plan => plan.name === 'Premium Visibilité');
      if (premiumVisibilityPlan) {
        console.log('Subscribing directly to Premium Visibilité plan');
        createCheckoutSession.mutate(premiumVisibilityPlan.id);
        return;
      }
      
      // Fallback: redirect to subscription page if Premium Visibilité plan not found
      console.log('Premium Visibilité plan not found, redirecting to subscription page');
      window.location.href = '/subscription';
      return;
    }

    console.log('Calling createCheckoutSession.mutate with planId:', planId);
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
        {(isPostRegistration || isRequired) && (
          <div className="mb-8 max-w-4xl mx-auto">
            <Alert className={isRequired ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
              <CheckCircle className={`h-4 w-4 ${isRequired ? "text-orange-600" : "text-green-600"}`} />
              <AlertDescription className={isRequired ? "text-orange-800" : "text-green-800"}>
                {isRequired ? (
                  <strong>Abonnement requis :</strong>
                ) : (
                  <strong>Félicitations ! Votre compte a été créé avec succès.</strong>
                )} Choisissez maintenant votre plan pour accéder à toutes les fonctionnalités de la plateforme.
                {userTypeParam === 'artist' && (
                  <span className="block mt-2 text-sm">
                    En tant qu'artiste, nous vous recommandons le plan Artistes (9€/mois) ou Premium Artistes (29€/mois) pour une visibilité maximale.
                  </span>
                )}
                {userTypeParam === 'professional' && (
                  <span className="block mt-2 text-sm">
                    En tant que professionnel, le plan Professionnels (49€/mois) vous donne accès à tous les outils de gestion avancés.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            {isPostRegistration ? 'Choisissez votre plan' : 'Plans et Tarifs'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isPostRegistration 
              ? 'Sélectionnez le plan qui correspond le mieux à vos besoins' 
              : 'Choisissez le plan qui correspond à vos besoins'
            }
          </p>
        </div>

        {/* Toggle buttons for user type selection */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted p-1 rounded-lg">
            <Button
              variant={selectedUserType === 'artist' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedUserType('artist')}
              className="flex items-center gap-2 px-4 py-2"
            >
              <User className="h-4 w-4" />
              Artiste
            </Button>
            <Button
              variant={selectedUserType === 'professional' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedUserType('professional')}
              className="flex items-center gap-2 px-4 py-2"
            >
              <Briefcase className="h-4 w-4" />
              Professionnel
            </Button>
          </div>
        </div>


        <div className="flex flex-wrap justify-center gap-6 max-w-6xl mx-auto">
          {getFilteredPlans()
            .sort((a, b) => a.display_order - b.display_order)
            .map((plan) => (
             <PricingCard
               key={plan.id}
               plan={plan}
               isCurrentPlan={subscription?.plan_id === plan.id}
               onSelectPlan={handleSelectPlan}
               isLoading={createCheckoutSession.isPending}
               userType={selectedUserType}
             />
          ))}
        </div>

        <div className="mt-12 text-center">
          {selectedUserType === 'artist' && (
            <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">🌟 Plan Premium Visibilité</h3>
              <p className="text-muted-foreground text-sm mb-3">
                Ajoutez l'option Premium Visibilité (+29€/mois) pour obtenir un badge premium, 
                une priorité dans les résultats de recherche et des analytics avancées.
              </p>
              <p className="text-xs text-muted-foreground">
                Disponible depuis votre profil une fois abonné au plan Artistes.
              </p>
            </div>
          )}

          <h2 className="text-2xl font-semibold mb-4">Questions fréquentes</h2>
          <div className="max-w-3xl mx-auto space-y-4 text-left">
            {selectedUserType === 'artist' && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Quelle est la différence entre les plans ?</h3>
                <p className="text-muted-foreground text-sm">
                  Le plan Artistes (9€/mois) vous donne accès à toutes les fonctionnalités essentielles. 
                  L'option Premium Visibilité (+29€/mois) ajoute un badge premium et une priorité dans les résultats.
                </p>
              </div>
            )}
            
            {selectedUserType === 'professional' && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">À propos de votre plan Professionnel</h3>
                <p className="text-muted-foreground text-sm">
                  Le plan Professionnels vous donne accès à toutes les fonctionnalités avancées 
                  pour gérer vos événements, castings et rechercher des talents efficacement.
                </p>
              </div>
            )}
            
            {selectedUserType === 'artist' && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Comment changer de plan ?</h3>
                <p className="text-muted-foreground text-sm">
                  Vous pouvez changer de plan à tout moment depuis votre espace de gestion d'abonnement. 
                  Les changements prennent effet immédiatement.
                </p>
              </div>
            )}

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