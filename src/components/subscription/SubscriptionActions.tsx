import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { CreditCard, Crown, AlertTriangle } from "lucide-react";
import { Subscription } from "@/hooks/useSubscription";
import { useState } from "react";

interface SubscriptionActionsProps {
  subscription: Subscription;
  onManageSubscription: () => void;
  onUpgradeToPremium?: () => void;
  isLoading: boolean;
}

export const SubscriptionActions = ({
  subscription,
  onManageSubscription,
  onUpgradeToPremium,
  isLoading
}: SubscriptionActionsProps) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const isPremium = subscription.plan?.name === "Artistes" || subscription.plan?.name === "Professionnels";
  const canUpgrade = subscription.plan && subscription.plan.price_monthly < 49;

  const handleCancelSubscription = () => {
    onManageSubscription();
    setShowCancelDialog(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cancel Subscription */}
        {subscription.status === 'active' && (
          <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Annuler l'abonnement
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir annuler votre abonnement ? Cette action :
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Prendra effet à la fin de votre période de facturation actuelle</li>
                    <li>Vous perdrez l'accès aux fonctionnalités premium</li>
                    <li>Peut être annulée avant la fin de la période</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Conserver l'abonnement</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelSubscription}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirmer l'annulation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};