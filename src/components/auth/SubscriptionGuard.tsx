import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, loading, hasActiveSubscription, subscriptionLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !subscriptionLoading && user && !hasActiveSubscription) {
      console.log('SubscriptionGuard: Vérification abonnement...');
      console.log('État actuel:', { 
        user: !!user, 
        loading, 
        subscriptionLoading, 
        hasActiveSubscription 
      });
      
      // Délai avant redirection pour laisser le temps aux abonnements test de se charger
      const timer = setTimeout(() => {
        if (!hasActiveSubscription) {
          console.log('Redirection vers /pricing après vérification finale');
          navigate('/pricing?source=required');
        }
      }, 2000); // Délai de 2 secondes

      return () => clearTimeout(timer);
    }
  }, [user, loading, hasActiveSubscription, subscriptionLoading, navigate]);

  if (loading || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // AuthGuard will handle this
  }

  if (!hasActiveSubscription) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="text-center p-8">
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="h-16 w-16 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Abonnement requis</h1>
              <p className="text-muted-foreground mb-6">
                Vous devez avoir un abonnement actif pour accéder à cette fonctionnalité.
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/pricing?source=required')}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Choisir un plan
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  Retour à l'accueil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};