import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const error = searchParams.get('error');

  useEffect(() => {
    // Log error for debugging
    console.log('Subscription error:', { sessionId, error });
  }, [sessionId, error]);

  const getErrorMessage = () => {
    switch (error) {
      case 'card_declined':
        return "Votre carte a été refusée. Vérifiez vos informations de paiement ou utilisez une autre carte.";
      case 'insufficient_funds':
        return "Fonds insuffisants sur votre compte. Veuillez vérifier votre solde ou utiliser une autre carte.";
      case 'expired_card':
        return "Votre carte a expiré. Veuillez utiliser une carte valide.";
      case 'processing_error':
        return "Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer.";
      default:
        return "Le paiement n'a pas pu être traité. Veuillez vérifier vos informations et réessayer.";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Paiement non abouti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-destructive/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getErrorMessage()}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  <p className="mb-4">Que faire maintenant ?</p>
                  <ul className="text-left space-y-2 text-sm">
                    <li>• Vérifiez que vos informations de carte sont correctes</li>
                    <li>• Assurez-vous d'avoir des fonds suffisants</li>
                    <li>• Contactez votre banque si le problème persiste</li>
                    <li>• Essayez avec une autre carte de paiement</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/pricing')}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Réessayer le paiement
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour au tableau de bord
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => navigate('/contact')}
                  >
                    Contacter le support
                  </Button>
                </div>

                {sessionId && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mt-4">
                      ID de session : {sessionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Référencez cet ID si vous contactez le support
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}