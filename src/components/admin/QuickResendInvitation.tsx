import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Mail, CheckCircle } from 'lucide-react';

export const QuickResendInvitation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  // Données pour l'invitation à renvoyer
  const invitationData = {
    profileId: '6fedd4c9-cabd-406a-b35e-7384a0655fb4',
    profileType: 'artist' as const,
    email: 'jbbejot+imostovoi@gmail.com',
    profileName: 'Ihor Mostovoï'
  };

  const handleResendInvitation = async () => {
    setIsLoading(true);
    
    try {
      console.log('Renvoi de l\'invitation pour:', invitationData);
      
      const { data, error } = await supabase.functions.invoke('send-account-invitation', {
        body: {
          profile_id: invitationData.profileId,
          profile_type: invitationData.profileType,
          real_email: invitationData.email
        }
      });

      if (error) {
        console.error('Erreur lors du renvoi de l\'invitation:', error);
        throw error;
      }

      console.log('Invitation renvoyée avec succès:', data);
      
      setSent(true);
      toast({
        title: "✅ Invitation renvoyée",
        description: `L'invitation a été renvoyée avec succès à ${invitationData.email} pour le profil ${invitationData.profileName}. 
        ${data?.email_sent ? '📧 Email envoyé avec succès.' : '⚠️ Email non envoyé (voir les logs).'}
        Lien d'invitation: ${data?.invitation_link || 'Non disponible'}`,
      });

    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "❌ Erreur",
        description: `Impossible de renvoyer l'invitation: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Renvoyer une invitation</h2>
      </div>
      
      <div className="bg-secondary/20 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Détails de l'invitation</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p><strong>Profil:</strong> {invitationData.profileName}</p>
          <p><strong>Type:</strong> Artiste</p>
          <p><strong>Email:</strong> {invitationData.email}</p>
        </div>
      </div>
      
      <Button 
        onClick={handleResendInvitation}
        disabled={isLoading || sent}
        size="lg"
        className="w-full"
      >
        {sent ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Invitation envoyée
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {isLoading ? 'Envoi en cours...' : 'Renvoyer l\'invitation'}
          </>
        )}
      </Button>

      {sent && (
        <div className="text-sm text-center text-muted-foreground">
          ✅ L'invitation a été renvoyée avec succès !
        </div>
      )}
    </div>
  );
};