import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { UserX, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeactivateAccountDialogProps {
  account: {
    id: string;
    user_id: string;
    stage_name?: string;
    company_name?: string;
    type: 'artist' | 'professional';
    is_active?: boolean;
  };
  onAccountUpdated: () => void;
}

const DeactivateAccountDialog = ({ account, onAccountUpdated }: DeactivateAccountDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleToggleActive = async () => {
    setIsProcessing(true);
    
    try {
      const tableName = account.type === 'artist' ? 'artist_profiles' : 'professional_profiles';
      const newActiveState = !account.is_active;
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: newActiveState })
        .eq('id', account.id);

      if (error) throw error;

      toast({
        title: newActiveState ? "Compte réactivé" : "Compte désactivé",
        description: newActiveState 
          ? `Le compte ${account.type === 'artist' ? 'artiste' : 'professionnel'} a été réactivé avec succès.`
          : `Le compte ${account.type === 'artist' ? 'artiste' : 'professionnel'} a été désactivé. L'utilisateur ne pourra plus accéder aux fonctionnalités payantes jusqu'à réactivation.`,
      });

      onAccountUpdated();
    } catch (error) {
      console.error('Error toggling account status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du compte.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const profileName = account.type === 'artist' ? account.stage_name : account.company_name;
  const isActive = account.is_active !== false; // Default to true if undefined

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          variant={isActive ? "outline" : "default"} 
          className="gap-1"
        >
          {isActive ? (
            <>
              <UserX className="h-3 w-3" />
              Désactiver
            </>
          ) : (
            <>
              <UserCheck className="h-3 w-3" />
              Réactiver
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                Êtes-vous sûr de vouloir désactiver le compte de{' '}
                <strong>{profileName}</strong> ?
                <br />
                <br />
                <strong>Conséquences de la désactivation :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>L'utilisateur ne pourra plus se connecter</li>
                  <li>Son profil ne sera plus visible publiquement</li>
                  <li>Ses abonnements et accès aux fonctionnalités payantes seront suspendus</li>
                  <li>Il recevra un message explicite lors de sa prochaine tentative de connexion</li>
                </ul>
                <br />
                <em>Le compte peut être réactivé à tout moment pour restaurer l'accès.</em>
              </>
            ) : (
              <>
                Êtes-vous sûr de vouloir réactiver le compte de{' '}
                <strong>{profileName}</strong> ?
                <br />
                <br />
                <strong>Conséquences de la réactivation :</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>L'utilisateur pourra de nouveau se connecter</li>
                  <li>Son profil redeviendra visible publiquement</li>
                  <li>Ses abonnements et accès aux fonctionnalités payantes seront restaurés</li>
                </ul>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleToggleActive}
            disabled={isProcessing}
            className={isActive ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-green-600 text-white hover:bg-green-700"}
          >
            {isProcessing ? 'Traitement...' : (isActive ? 'Désactiver le compte' : 'Réactiver le compte')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeactivateAccountDialog;