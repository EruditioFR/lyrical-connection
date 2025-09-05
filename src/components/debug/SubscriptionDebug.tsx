import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

const SubscriptionDebug = () => {
  const { user, hasActiveSubscription, subscriptionLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('=== DEBUG SUBSCRIPTION CHECK ===');
      
      // 1. Vérifier avec Stripe via edge function
      const { data: stripeData, error: stripeError } = await supabase.functions.invoke('check-subscription');
      console.log('Réponse Stripe:', stripeData, stripeError);
      
      // 2. Vérifier la base de données locale
      const { data: subscriptionData, error: dbError } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      console.log('Données DB:', subscriptionData, dbError);
      
      setDebugInfo({
        stripe: { data: stripeData, error: stripeError },
        database: { data: subscriptionData, error: dbError },
        authState: {
          hasActiveSubscription,
          subscriptionLoading,
          userId: user.id,
          email: user.email
        },
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Erreur debug:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Debug Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Utilisateur non connecté</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Debug Abonnement
          <Button
            onClick={checkSubscription}
            disabled={loading}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vérifier
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">État actuel:</p>
            <Badge variant={hasActiveSubscription ? "default" : "secondary"}>
              {hasActiveSubscription ? "Abonné" : "Pas d'abonnement"}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Chargement:</p>
            <Badge variant={subscriptionLoading ? "outline" : "secondary"}>
              {subscriptionLoading ? "En cours..." : "Terminé"}
            </Badge>
          </div>
        </div>
        
        {debugInfo && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Informations de debug:</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>Utilisateur: {user.email}</p>
          <p>ID: {user.id}</p>
          <p>Note: Les abonnements en mode test Stripe sont considérés comme des abonnements réels</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionDebug;