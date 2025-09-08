import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 seconde

    const checkResetSession = async () => {
      try {
        // D'abord vérifier les paramètres URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('=== DEBUG RESET PASSWORD ===');
        console.log('URL complète:', window.location.href);
        console.log('Paramètres URL:', {
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'absent',
          refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'absent',
          type
        });
        
        // Si aucun paramètre de récupération n'est présent, lien invalide
        if (!accessToken && !refreshToken && type !== 'recovery') {
          console.log('Aucun paramètre de récupération trouvé');
          setIsValidSession(false);
          setCheckingSession(false);
          return;
        }
        
        // Si nous avons un token de récupération, le valider
        if (accessToken && type === 'recovery') {
          console.log('Token de récupération trouvé, validation...');
          
          // Pour les liens de récupération, le token d'accès dans l'URL est suffisant
          // Pas besoin d'échanger ou de définir une session, juste valider que le lien est correct
          if (accessToken.length > 20) { // Validation basique de la longueur du token
            console.log('Token de récupération valide');
            setIsValidSession(true);
            setCheckingSession(false);
            return;
          } else {
            console.log('Token de récupération invalide (trop court)');
            setIsValidSession(false);
            setCheckingSession(false);
            return;
          }
        }
        
        // Vérifier la session courante
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erreur session:', sessionError);
          
          // Si c'est la première tentative et qu'on a des tokens, essayer encore
          if (retryCount < maxRetries && (accessToken || refreshToken)) {
            retryCount++;
            console.log(`Session pas encore prête, nouvelle tentative ${retryCount}/${maxRetries} dans ${retryDelay}ms...`);
            setTimeout(checkResetSession, retryDelay);
            return;
          }
          
          setIsValidSession(false);
          setCheckingSession(false);
          return;
        }

        console.log('Session trouvée:', session ? 'OUI' : 'NON');
        console.log('Session user:', session?.user?.email);
        
        // Si on a une session et des paramètres de récupération, c'est valide
        if (session && (type === 'recovery' || accessToken || refreshToken)) {
          console.log('Session de réinitialisation valide');
          setIsValidSession(true);
        } else if (!session && (accessToken || refreshToken) && retryCount < maxRetries) {
          // Session pas encore établie, réessayer
          retryCount++;
          console.log(`Session pas encore établie, nouvelle tentative ${retryCount}/${maxRetries} dans ${retryDelay}ms...`);
          setTimeout(checkResetSession, retryDelay);
          return;
        } else {
          console.log('Session invalide');
          setIsValidSession(false);
          toast({
            title: "Lien invalide",
            description: "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
            variant: "destructive"
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        
        // Réessayer si pas déjà fait
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`Erreur, nouvelle tentative ${retryCount}/${maxRetries} dans ${retryDelay}ms...`);
          setTimeout(checkResetSession, retryDelay);
          return;
        }
        
        setIsValidSession(false);
      } finally {
        // Ne set checkingSession à false que si on ne va pas réessayer
        if (retryCount >= maxRetries) {
          setCheckingSession(false);
        }
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
      // Récupérer le token depuis l'URL
      const accessToken = searchParams.get('access_token');
      
      if (accessToken) {
        console.log('Utilisation du token de récupération pour établir une session temporaire...');
        
        // D'abord, vérifier le token de récupération pour établir une session temporaire
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery'
        });

        if (verifyError) {
          console.error('Erreur lors de la vérification du token:', verifyError);
          toast({
            title: "Erreur",
            description: "Token de récupération invalide ou expiré",
            variant: "destructive"
          });
          return;
        }

        if (verifyData.session) {
          console.log('Session temporaire établie, mise à jour du mot de passe...');
          
          // Maintenant qu'on a une session, mettre à jour le mot de passe
          const { error: updateError } = await supabase.auth.updateUser({
            password: passwordForm.password
          });

          if (updateError) {
            toast({
              title: "Erreur",
              description: updateError.message,
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
        } else {
          toast({
            title: "Erreur",
            description: "Impossible d'établir une session avec le token de récupération",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Erreur",
          description: "Token de récupération manquant",
          variant: "destructive"
        });
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
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 caractères"
                      value={passwordForm.password} 
                      onChange={e => setPasswordForm({
                        ...passwordForm,
                        password: e.target.value
                      })} 
                      required 
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Répétez le nouveau mot de passe"
                      value={passwordForm.confirmPassword} 
                      onChange={e => setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value
                      })} 
                      required 
                      minLength={8}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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