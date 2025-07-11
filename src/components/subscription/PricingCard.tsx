import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { SubscriptionPlan } from "@/hooks/useSubscription";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

export const PricingCard = ({ plan, isCurrentPlan, onSelectPlan, isLoading }: PricingCardProps) => {
  const isPopular = plan.name === "Premium";

  return (
    <Card className={`relative ${isPopular ? 'ring-2 ring-primary' : ''} ${isCurrentPlan ? 'ring-2 ring-accent' : ''}`}>
      {isPopular && (
        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
          Populaire
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge className="absolute -top-2 right-4 bg-accent text-accent-foreground">
          Plan actuel
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
        <div className="flex items-baseline justify-center gap-1 mt-2">
          <span className="text-3xl font-bold">
            {plan.price_monthly === 0 ? 'Gratuit' : `${plan.price_monthly}€`}
          </span>
          {plan.price_monthly > 0 && (
            <span className="text-sm text-muted-foreground">/mois</span>
          )}
        </div>
        {plan.trial_days > 0 && (
          <p className="text-sm text-muted-foreground">
            {plan.trial_days} jours d'essai gratuit
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {plan.description}
        </p>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Fonctionnalités incluses :</h4>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={() => onSelectPlan(plan.id)}
          disabled={isCurrentPlan || isLoading || plan.name === 'Gratuit'}
        >
          {isCurrentPlan ? 'Plan actuel' : 
           plan.name === 'Gratuit' ? 'Sur invitation' :
           isLoading ? 'Chargement...' : 'Choisir ce plan'}
        </Button>
      </CardFooter>
    </Card>
  );
};