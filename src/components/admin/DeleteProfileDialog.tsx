
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
      const tableName = account.type === 'artist' ? 'artist_profiles' : 'professional_profiles';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', account.id);

      if (error) throw error;

      toast({
        title: "Profil supprimé",
        description: `Le profil ${account.type === 'artist' ? 'artiste' : 'professionnel'} a été supprimé avec succès.`,
      });

      onProfileDeleted();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le profil.",
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
            Êtes-vous sûr de vouloir supprimer définitivement le profil de{' '}
            <strong>{profileName}</strong> ?
            <br />
            <br />
            Cette action supprimera toutes les données associées au profil :
            <ul className="list-disc list-inside mt-2 space-y-1">
              {account.type === 'artist' ? (
                <>
                  <li>Photos du profil</li>
                  <li>Enregistrements audio/vidéo</li>
                  <li>Répertoire</li>
                  <li>Candidatures</li>
                </>
              ) : (
                <>
                  <li>Médias professionnels</li>
                  <li>Disponibilités</li>
                  <li>Profils cibles</li>
                  <li>Castings créés</li>
                  <li>Événements créés</li>
                </>
              )}
            </ul>
            <br />
            <strong>Cette action est irréversible.</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProfileDialog;
