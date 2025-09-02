import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Eye } from "lucide-react";
import { SubscriptionPlan } from "@/hooks/useSubscription";

interface PlanComparisonCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
  currentPlanPrice?: number;
  onSelectPlan: (planId: string) => void;
  isLoading: boolean;
  userType?: 'artist' | 'professional' | 'unknown';
}

export const PlanComparisonCard = ({
  plan,
  isCurrentPlan,
  currentPlanPrice = 0,
  onSelectPlan,
  isLoading,
  userType = 'unknown'
}: PlanComparisonCardProps) => {
  const isUpgrade = plan.price_monthly > currentPlanPrice;
  const isDowngrade = plan.price_monthly < currentPlanPrice && !isCurrentPlan;
  const isPremium = plan.name === "Premium Visibilité";
  const isPremiumVisibility = plan.name === "Premium Visibilité";

  const getActionButton = () => {
    if (isCurrentPlan) {
      return (
        <Button disabled className="w-full" variant="outline">
          Plan actuel
        </Button>
      );
    }

    if (isUpgrade) {
      return (
        <Button 
          onClick={() => onSelectPlan(plan.id)}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Chargement...' : 'Upgrader maintenant'}
        </Button>
      );
    }

    if (isDowngrade) {
      return (
        <Button 
          onClick={() => onSelectPlan(plan.id)}
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          {isLoading ? 'Chargement...' : 'Rétrograder (fin de période)'}
        </Button>
      );
    }

    return (
      <Button 
        onClick={() => onSelectPlan(plan.id)}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Chargement...' : 'Choisir ce plan'}
      </Button>
    );
  };

  return (
    <Card className={`relative ${isPremium ? 'border-primary ring-2 ring-primary/50' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPremiumVisibility ? 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary' : ''}`}>
      {isPremium && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Option Premium
          </Badge>
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Plan actuel</Badge>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="text-3xl font-bold">
          {plan.price_monthly === 0 ? (
            'Gratuit'
          ) : (
            <>
              {plan.price_monthly}€
              <span className="text-sm font-normal text-muted-foreground">/mois</span>
            </>
          )}
        </div>
        <p className="text-muted-foreground">{plan.description}</p>
        
        {isPremiumVisibility && (
          <div className="mt-4 p-4 bg-primary/15 rounded-lg border border-primary/30">
            <div className="flex items-center gap-2 text-primary font-bold mb-3">
              <Star className="h-5 w-5" />
              Votre profil affiché et mis en valeur pour tous les visiteurs
            </div>
            <p className="text-sm text-foreground/80 mb-3">
              Cette option premium transforme la visibilité de votre profil sur toute la plateforme. 
              Idéale pour les artistes qui souhaitent maximiser leur exposition et attirer plus d&apos;opportunités.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="font-medium">Profil affiché en premier dans toutes les recherches</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <span className="font-medium">Badge "Premium" visible partout sur votre profil</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="font-medium">Mise en avant sur la page d&apos;accueil et pages artistes</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Fonctionnalités incluses :</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {plan.trial_days > 0 && !isCurrentPlan && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">🎯 Essai gratuit de {plan.trial_days} jours</p>
          </div>
        )}

        <div className="pt-4">
          {getActionButton()}
        </div>

        {isUpgrade && (
          <p className="text-xs text-muted-foreground text-center">
            Effet immédiat • Facturation proratée
          </p>
        )}

        {isDowngrade && (
          <p className="text-xs text-muted-foreground text-center">
            Prend effet à la fin de la période actuelle
          </p>
        )}
      </CardContent>
    </Card>
  );
};