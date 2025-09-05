import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, RefreshCw, Clock } from 'lucide-react';

interface InviteAccountButtonProps {
  profileId: string;
  profileType: 'artist' | 'professional';
  profileName: string;
}

export const InviteAccountButton = ({ profileId, profileType, profileName }: InviteAccountButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingInvitation, setExistingInvitation] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadExistingInvitation();
  }, [profileId]);

  useEffect(() => {
    if (isOpen) {
      loadExistingInvitation();
    }
  }, [isOpen, profileId]);

  const loadExistingInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('account_invitations')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading existing invitation:', error);
        return;
      }

      setExistingInvitation(data);
      if (data) {
        setEmail(data.real_email);
      }
    } catch (error) {
      console.error('Error loading existing invitation:', error);
    }
  };

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
        title: existingInvitation ? "Invitation renvoyée" : "Invitation envoyée",
        description: `Une ${existingInvitation ? 'nouvelle ' : ''}invitation a été envoyée à ${email} pour accéder au compte ${profileName}.`,
      });

      setEmail('');
      setExistingInvitation(null);
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
        {existingInvitation ? (
          <>
            <RefreshCw className="h-4 w-4" />
            Renvoyer
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Inviter
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {existingInvitation ? 'Renvoyer l\'invitation' : 'Inviter l\'utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {existingInvitation 
                ? `Renvoyez une nouvelle invitation à l'utilisateur pour qu'il puisse accéder à son compte ${profileType} "${profileName}".`
                : `Envoyez une invitation à l'utilisateur pour qu'il puisse accéder à son compte ${profileType} "${profileName}".`
              }
            </DialogDescription>
          </DialogHeader>

          {existingInvitation && (
            <div className="bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                Invitation en cours
              </div>
              <div className="space-y-1 text-sm">
                <div>Email: {existingInvitation.real_email}</div>
                <div>Envoyée le: {new Date(existingInvitation.created_at).toLocaleDateString()}</div>
                <div>Expire le: {new Date(existingInvitation.expires_at).toLocaleDateString()}</div>
                <Badge variant="secondary" className="text-xs">
                  Non utilisée
                </Badge>
              </div>
            </div>
          )}

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
                {isLoading 
                  ? 'Envoi...' 
                  : existingInvitation 
                    ? 'Renvoyer l\'invitation' 
                    : 'Envoyer l\'invitation'
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};