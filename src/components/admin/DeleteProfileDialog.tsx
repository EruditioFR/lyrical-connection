
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
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DeleteProfileDialogProps {
  account: {
    id: string;
    user_id: string;
    stage_name?: string;
    company_name?: string;
    type: 'artist' | 'professional';
  };
  onProfileDeleted: () => void;
}

const DeleteProfileDialog = ({ account, onProfileDeleted }: DeleteProfileDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Use the edge function to completely delete the user
      const { data, error } = await supabase.functions.invoke('delete-user-admin', {
        body: { userIdToDelete: account.user_id }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${account.type === 'artist' ? 'artiste' : 'professionnel'} a été complètement supprimé de la base de données.`,
      });

      onProfileDeleted();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'utilisateur.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const profileName = account.type === 'artist' ? account.stage_name : account.company_name;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-1">
          <Trash2 className="h-3 w-3" />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer <strong>DÉFINITIVEMENT</strong> l'utilisateur{' '}
            <strong>{profileName}</strong> ?
            <br />
            <br />
            <strong>⚠️ ATTENTION :</strong> Cette action supprimera complètement l'utilisateur de la base de données, y compris son compte d'authentification.
            <br />
            <br />
            Cette action supprimera toutes les données associées :
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Compte d'authentification</strong> (l'utilisateur ne pourra plus se connecter)</li>
              {account.type === 'artist' ? (
                <>
                  <li>Profil artiste complet</li>
                  <li>Photos du profil</li>
                  <li>Enregistrements audio/vidéo</li>
                  <li>Répertoire</li>
                  <li>Candidatures</li>
                  <li>Messages et conversations</li>
                </>
              ) : (
                <>
                  <li>Profil professionnel complet</li>
                  <li>Médias professionnels</li>
                  <li>Disponibilités</li>
                  <li>Profils cibles</li>
                  <li>Castings créés</li>
                  <li>Événements créés</li>
                  <li>Messages et conversations</li>
                </>
              )}
            </ul>
            <br />
            <strong>⚠️ Cette action est IRRÉVERSIBLE et DÉFINITIVE.</strong>
            <br />
            <em>Si vous souhaitez simplement suspendre l'accès temporairement, utilisez la fonction "Désactiver" à la place.</em>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Suppression...' : 'SUPPRIMER DÉFINITIVEMENT'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProfileDialog;
