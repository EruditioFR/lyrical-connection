import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

interface InviteAccountButtonProps {
  profileId: string;
  profileType: 'artist' | 'professional';
  profileName: string;
}

export const InviteAccountButton = ({ profileId, profileType, profileName }: InviteAccountButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "L'email est requis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-account-invitation', {
        body: {
          profile_id: profileId,
          profile_type: profileType,
          real_email: email,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${email} pour accéder au compte ${profileName}.`,
      });

      setEmail('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Mail className="h-4 w-4" />
        Inviter
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter l'utilisateur</DialogTitle>
            <DialogDescription>
              Envoyez une invitation à l'utilisateur pour qu'il puisse accéder à son compte {profileType} "{profileName}".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};