import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Calendar, Users, Settings } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
export const SubscriptionManager = () => {
  const {
    subscription,
    subscriptionLoading,
    manageSubscription,
    checkSubscriptionStatus,
    isSubscribed
  } = useSubscription();
  useEffect(() => {
    // Check subscription status on component mount
    checkSubscriptionStatus.mutate();
  }, []);
  if (subscriptionLoading) {
    return <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>;
  }
  if (!isSubscribed || !subscription) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Aucun abonnement actif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas d'abonnement actif. Consultez nos plans pour débloquer toutes les fonctionnalités.
          </p>
          <Button onClick={() => window.location.href = '/pricing'}>
            Voir les plans
          </Button>
        </CardContent>
      </Card>;
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-100 text-blue-800">Période d'essai</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-800">Paiement en retard</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  return <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Abonnement actuel
            </div>
            {getStatusBadge(subscription.status)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg">{subscription.plan?.name}</h3>
              <p className="text-muted-foreground">{subscription.plan?.description}</p>
              <p className="text-2xl font-bold mt-2">
                {subscription.plan?.price_monthly === 0 ? 'Gratuit' : `${subscription.plan?.price_monthly}€/mois`}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Période actuelle</p>
                  <p className="text-sm font-medium">
                    {format(new Date(subscription.current_period_start), 'dd MMMM yyyy', {
                    locale: fr
                  })} - {' '}
                    {format(new Date(subscription.current_period_end), 'dd MMMM yyyy', {
                    locale: fr
                  })}
                  </p>
                </div>
              </div>

              {subscription.trial_end && new Date(subscription.trial_end) > new Date() && <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fin de l'essai gratuit</p>
                    <p className="text-sm font-medium">
                      {format(new Date(subscription.trial_end), 'dd MMMM yyyy', {
                    locale: fr
                  })}
                    </p>
                  </div>
                </div>}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Fonctionnalités incluses</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {subscription.plan?.features.map((feature, index) => <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>{feature}</span>
                </div>)}
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => manageSubscription.mutate()} disabled={manageSubscription.isPending} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {manageSubscription.isPending ? 'Chargement...' : 'Gérer l\'abonnement'}
            </Button>
            
            <Button variant="outline" onClick={() => checkSubscriptionStatus.mutate()} disabled={checkSubscriptionStatus.isPending}>
              {checkSubscriptionStatus.isPending ? 'Vérification...' : 'Actualiser le statut'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage and Limits */}
      {subscription.plan?.limitations}
    </div>;
};