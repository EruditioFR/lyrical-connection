import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AccountDeactivatedMessage = () => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleContactSupport = () => {
    window.location.href = '/contact';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Compte désactivé</CardTitle>
          <CardDescription>
            Votre compte a été temporairement désactivé par un administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Votre accès est actuellement suspendu :</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Vous ne pouvez pas accéder aux fonctionnalités du site</li>
              <li>Votre profil n'est plus visible publiquement</li>
              <li>Vos abonnements et services payants sont suspendus</li>
            </ul>
            <p className="mt-4">
              <strong>Que faire maintenant ?</strong>
            </p>
            <p>
              Contactez notre équipe support pour connaître la raison de cette désactivation et les étapes pour réactiver votre compte.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={handleContactSupport}
              className="w-full gap-2"
              variant="default"
            >
              <Mail className="w-4 h-4" />
              Contacter le support
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Se déconnecter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountDeactivatedMessage;