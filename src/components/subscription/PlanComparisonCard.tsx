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
      return <Button disabled className="w-full" variant="outline">
          Plan actuel
        </Button>;
    }
    if (isUpgrade) {
      return <Button onClick={() => onSelectPlan(plan.id)} disabled={isLoading} className="w-full">
          {isLoading ? 'Chargement...' : 'Upgrader maintenant'}
        </Button>;
    }
    if (isDowngrade) {
      return <Button onClick={() => onSelectPlan(plan.id)} disabled={isLoading} variant="outline" className="w-full">
          {isLoading ? 'Chargement...' : 'Rétrograder (fin de période)'}
        </Button>;
    }
    return <Button onClick={() => onSelectPlan(plan.id)} disabled={isLoading} className="w-full">
        {isLoading ? 'Chargement...' : 'Choisir ce plan'}
      </Button>;
  };
  return <Card className={`relative ${isPremium ? 'border-primary ring-2 ring-primary/50' : ''} ${isCurrentPlan ? 'ring-2 ring-primary' : ''} ${isPremiumVisibility ? 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary' : ''}`}>
      {isPremium && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
            <Crown className="h-3 w-3 mr-1" />
            Option Premium
          </Badge>
        </div>}
      
      {isCurrentPlan && <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Plan actuel</Badge>
        </div>}

      <CardHeader className="text-center">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <div className="text-3xl font-bold">
          {plan.price_monthly === 0 ? 'Gratuit' : <>
              {plan.price_monthly}€
              <span className="text-sm font-normal text-muted-foreground">/mois</span>
            </>}
        </div>
        <p className="text-muted-foreground">{plan.description}</p>
        
        {isPremiumVisibility}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold">Fonctionnalités incluses :</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => <li key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>)}
          </ul>
        </div>

        {plan.limitations && Object.keys(plan.limitations).length > 0 && <div className="space-y-2">
            <h4 className="font-semibold">🎯 Essai gratuit de 15 jours pour les nouveaux utilisateurs</h4>
            <div className="space-y-1">
              {Object.entries(plan.limitations).map(([key, value]) => <div key={key} className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-medium">
                    {typeof value === 'boolean' ? value ? 'Oui' : 'Non' : String(value)}
                  </span>
                </div>)}
            </div>
          </div>}

        {plan.trial_days > 0 && !isCurrentPlan && <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">🎯 Essai gratuit de {plan.trial_days} jours</p>
          </div>}

        <div className="pt-4">
          {getActionButton()}
        </div>

        {isUpgrade && <p className="text-xs text-muted-foreground text-center">
            Effet immédiat • Facturation proratée
          </p>}

        {isDowngrade && <p className="text-xs text-muted-foreground text-center">
            Prend effet à la fin de la période actuelle
          </p>}
      </CardContent>
    </Card>;
};