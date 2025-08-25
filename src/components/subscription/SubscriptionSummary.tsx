import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePremiumVisibility } from '@/hooks/usePremiumVisibility';

interface SubscriptionSummaryProps {
  profileType?: 'artist' | 'professional';
  profileId?: string;
}

const SubscriptionSummary: React.FC<SubscriptionSummaryProps> = ({ 
  profileType, 
  profileId 
}) => {
  const { subscription, manageSubscription } = useSubscription();
  const { isPremiumActive, getPremiumEndDate } = usePremiumVisibility();
  
  const hasPremiumVisibility = profileType && profileId ? 
    isPremiumActive(profileType, profileId) : false;
  const premiumEndDate = profileType && profileId ? 
    getPremiumEndDate(profileType, profileId) : null;

  const handleManageSubscriptions = () => {
    manageSubscription.mutate();
  };

  if (!subscription && !hasPremiumVisibility) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Mes Abonnements
          </CardTitle>
          <CardDescription>
            Aucun abonnement actif
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas d'abonnement actif.
            </p>
            <Button asChild>
              <a href="/subscription">
                Découvrir nos plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMonthly = (subscription?.plan?.price_monthly || 0) + (hasPremiumVisibility ? 29 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Mes Abonnements
            </CardTitle>
            <CardDescription>
              Récapitulatif de vos abonnements actifs
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {totalMonthly}€<span className="text-sm font-normal text-muted-foreground">/mois</span>
            </div>
            <p className="text-xs text-muted-foreground">Total mensuel</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Abonnement standard */}
          {subscription && subscription.plan && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{subscription.plan.name}</h3>
                  <Badge variant="default">Actif</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.plan.description}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3" />
                  Actif jusqu'au {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {subscription.plan.price_monthly === 0 ? 'Gratuit' : `${subscription.plan.price_monthly}€/mois`}
                </div>
              </div>
            </div>
          )}

          {/* Add-on Visibilité Premium */}
          {hasPremiumVisibility && (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5 border-primary/20">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-primary">Visibilité Premium</h3>
                  <Badge variant="default" className="bg-primary">Add-on</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Option premium pour apparaître sur les pages publiques
                </p>
                {premiumEndDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="w-3 h-3" />
                    Actif jusqu'au {premiumEndDate.toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">29€/mois</div>
              </div>
            </div>
          )}

          {/* Bouton de gestion */}
          <div className="pt-4 border-t">
            <Button 
              onClick={handleManageSubscriptions}
              disabled={manageSubscription.isPending}
              variant="outline"
              className="w-full"
            >
              {manageSubscription.isPending ? (
                'Chargement...'
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Gérer mes abonnements
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Modifiez, suspendez ou résiliez vos abonnements
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSummary;