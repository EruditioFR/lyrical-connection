import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const checkResetSession = async () => {
      try {
        // Vérifier si nous avons une session valide suite à un lien de réinitialisation
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur session:', error);
          setIsValidSession(false);
          return;
        }

        // Vérifier si c'est bien une session de réinitialisation de mot de passe
        // En regardant les paramètres de l'URL ou la session
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        if (session && (type === 'recovery' || accessToken || refreshToken)) {
          setIsValidSession(true);
        } else {
          setIsValidSession(false);
          toast({
            title: "Lien invalide",
            description: "Ce lien de réinitialisation est invalide ou a expiré.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setIsValidSession(false);
      } finally {
        setCheckingSession(false);
      }
    };

    checkResetSession();
  }, [searchParams, navigate, toast]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.password.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.password
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été modifié avec succès. Vous allez être redirigé."
        });
        
        // Déconnecter l'utilisateur et le rediriger vers la page de connexion
        await supabase.auth.signOut();
        setTimeout(() => {
          navigate('/auth?message=password-changed');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Vérification du lien...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isValidSession) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="text-center p-8">
                <div className="flex items-center justify-center mb-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-4">Lien invalide</h1>
                <p className="text-muted-foreground mb-6">
                  Ce lien de réinitialisation de mot de passe est invalide ou a expiré.
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full"
                >
                  Retour à la connexion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">Nouveau mot de passe</h1>
            <p className="text-muted-foreground">
              Choisissez un nouveau mot de passe sécurisé
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Réinitialiser le mot de passe</CardTitle>
              <CardDescription>
                Saisissez votre nouveau mot de passe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Minimum 8 caractères"
                    value={passwordForm.password} 
                    onChange={e => setPasswordForm({
                      ...passwordForm,
                      password: e.target.value
                    })} 
                    required 
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Répétez le nouveau mot de passe"
                    value={passwordForm.confirmPassword} 
                    onChange={e => setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value
                    })} 
                    required 
                    minLength={8}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h3 className="font-medium text-blue-900 mb-1">
                        Conseils pour un mot de passe sécurisé :
                      </h3>
                      <ul className="text-blue-700 space-y-1 list-disc list-inside">
                        <li>Au moins 8 caractères</li>
                        <li>Mélange de lettres, chiffres et symboles</li>
                        <li>Évitez les informations personnelles</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                  disabled={loading}
                >
                  {loading ? 'Modification...' : 'Modifier le mot de passe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;