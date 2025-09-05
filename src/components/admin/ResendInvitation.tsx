import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send } from 'lucide-react';

interface ResendInvitationProps {
  profileId: string;
  profileType: 'artist' | 'professional';
  email: string;
  profileName: string;
}

export const ResendInvitation: React.FC<ResendInvitationProps> = ({
  profileId,
  profileType,
  email,
  profileName
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResendInvitation = async () => {
    setIsLoading(true);
    
    try {
      console.log('Resending invitation for:', { profileId, profileType, email });
      
      const { data, error } = await supabase.functions.invoke('send-account-invitation', {
        body: {
          profile_id: profileId,
          profile_type: profileType,
          real_email: email
        }
      });

      if (error) {
        console.error('Erreur lors du renvoi de l\'invitation:', error);
        throw error;
      }

      console.log('Invitation renvoyée avec succès:', data);
      
      toast({
        title: "Invitation renvoyée",
        description: `L'invitation a été renvoyée avec succès à ${email} pour le profil ${profileName}. ${data?.email_sent ? 'Email envoyé.' : 'Email non envoyé (voir les logs).'}`,
      });

    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: `Impossible de renvoyer l'invitation: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">Renvoyer l'invitation</h3>
        <p className="text-sm text-muted-foreground">
          Profil: {profileName} ({profileType})
        </p>
        <p className="text-sm text-muted-foreground">
          Email: {email}
        </p>
      </div>
      
      <Button 
        onClick={handleResendInvitation}
        disabled={isLoading}
        size="sm"
        className="w-fit"
      >
        <Send className="w-4 h-4 mr-2" />
        {isLoading ? 'Envoi en cours...' : 'Renvoyer l\'invitation'}
      </Button>
    </div>
  );
};