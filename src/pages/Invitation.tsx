import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserCheck, Mail } from 'lucide-react';

const Invitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token) {
      loadInvitation();
    }
  }, [token]);

  const loadInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('account_invitations')
        .select('*')
        .eq('invitation_token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        toast({
          title: "Invitation invalide",
          description: "Cette invitation n'existe pas ou a expiré.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      setInvitation(data);
      setEmail(data.real_email);
    } catch (error) {
      console.error('Error loading invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'invitation.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "L'email et le mot de passe sont requis.",
        variant: "destructive",
      });
      return;
    }

    setAccepting(true);

    try {
      // Créer le compte utilisateur avec l'email réel
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Transférer le profil vers le nouvel utilisateur
        const tableName = invitation.profile_type === 'artist' ? 'artist_profiles' : 'professional_profiles';
        
        const { error: updateError } = await supabase
          .from(tableName)
          .update({
            user_id: authData.user.id,
            contact_email: email,
          })
          .eq('id', invitation.profile_id);

        if (updateError) throw updateError;

        // Marquer l'invitation comme utilisée
        await supabase
          .from('account_invitations')
          .update({
            is_used: true,
            used_at: new Date().toISOString(),
          })
          .eq('id', invitation.id);

        toast({
          title: "Compte activé",
          description: "Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.",
        });

        navigate('/auth');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'activer le compte.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Activez votre compte</CardTitle>
          <CardDescription>
            Vous avez été invité à rejoindre Lyrical Connection en tant que{' '}
            {invitation.profile_type === 'artist' ? 'artiste' : 'professionnel'}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={accepting}>
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activation en cours...
                </>
              ) : (
                'Activer mon compte'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitation;