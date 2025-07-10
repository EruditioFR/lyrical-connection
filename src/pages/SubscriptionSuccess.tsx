import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkSubscriptionStatus } = useSubscription();

  useEffect(() => {
    // Check subscription status when arriving on success page
    if (sessionId) {
      // Wait a bit for Stripe to process the webhook
      setTimeout(() => {
        checkSubscriptionStatus.mutate();
      }, 2000);
    }
  }, [sessionId]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-800">
                Abonnement activé !
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Votre abonnement a été activé avec succès. Vous pouvez maintenant 
                profiter de toutes les fonctionnalités de votre plan.
              </p>
              
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/subscription'}
                >
                  Voir mon abonnement
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Retour au tableau de bord
                </Button>
              </div>

              {sessionId && (
                <p className="text-xs text-muted-foreground mt-4">
                  ID de session : {sessionId}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}