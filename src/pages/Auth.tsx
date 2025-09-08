import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Music, LogIn, UserPlus, User, Briefcase, Mail, CheckCircle, Shield, Clock, ExternalLink, ArrowRight, Star, Users, Building } from 'lucide-react';
import { cn } from "@/lib/utils";

// Composant Auth refactorisé sans Tabs
const professionalRoles = [{
  value: 'casting_director',
  label: 'Directeur de casting / Directeur artistique'
}, {
  value: 'vocal_coach',
  label: 'Chef de chant / Coach vocal'
}, {
  value: 'conductor',
  label: 'Chef d\'orchestre'
}, {
  value: 'opera_house_manager',
  label: 'Responsable de maison d\'opéra'
}, {
  value: 'voice_teacher',
  label: 'Professeur de chant / Pédagogue'
}, {
  value: 'artistic_agent',
  label: 'Agent artistique / Manager'
}, {
  value: 'producer',
  label: 'Producteur de spectacle / festival'
}, {
  value: 'competition_director',
  label: 'Directeur de concours / jury'
}];
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Nouveaux états pour gérer la sélection
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'artist' | 'professional'>('artist');

  // Vérifier les messages de succès dans l'URL
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'password-changed') {
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter."
      });
      // Nettoyer l'URL
      navigate('/auth', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  // Redirection si déjà authentifié
  useEffect(() => {
    if (user) {
      console.log('Utilisateur déjà connecté, redirection vers /');
      navigate('/');
    }
  }, [user, navigate]);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [artistSignupForm, setArtistSignupForm] = useState({
    email: '',
    password: '',
    stageName: '',
    confirmPassword: ''
  });
  const [professionalSignupForm, setProfessionalSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    professionalRole: ''
  });
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Tentative de connexion pour:', loginForm.email);
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });
      if (error) {
        console.error('Erreur de connexion:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Connexion réussie');
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !"
        });
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
      } else {
        setForgotPasswordSent(true);
        toast({
          title: "Email envoyé",
          description: "Un email de réinitialisation a été envoyé à votre adresse"
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
  const handleArtistSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (artistSignupForm.password !== artistSignupForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Inscription artiste pour:', artistSignupForm.email);
      const {
        error
      } = await supabase.auth.signUp({
        email: artistSignupForm.email,
        password: artistSignupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/pricing?source=signup&type=artist`,
          data: {
            user_type: 'artist',
            stage_name: artistSignupForm.stageName
          }
        }
      });
      if (error) {
        console.error('Erreur inscription artiste:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Inscription artiste réussie');
        setSignupEmail(artistSignupForm.email);
        setSignupSuccess(true);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleProfessionalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (professionalSignupForm.password !== professionalSignupForm.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    if (!professionalSignupForm.professionalRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre métier",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      console.log('Inscription professionnel pour:', professionalSignupForm.email);
      const {
        error
      } = await supabase.auth.signUp({
        email: professionalSignupForm.email,
        password: professionalSignupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/pricing?source=signup&type=professional`,
          data: {
            user_type: 'professional',
            company_name: professionalSignupForm.companyName,
            professional_role: professionalSignupForm.professionalRole
          }
        }
      });
      if (error) {
        console.error('Erreur inscription professionnel:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('Inscription professionnel réussie');
        setSignupEmail(professionalSignupForm.email);
        setSignupSuccess(true);
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (signupSuccess) {
    return <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                    <Mail className="h-8 w-8 text-lyrical-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif font-bold mb-2">
                  Inscription réussie !
                </CardTitle>
                <CardDescription className="text-base">
                  Votre compte a été créé avec succès
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-medium text-blue-900 mb-1">
                        Confirmation requise
                      </h3>
                      <p className="text-sm text-blue-700 mb-2">
                        Un email de confirmation a été envoyé à :
                      </p>
                      <p className="text-sm font-medium text-blue-900 bg-blue-100 rounded px-2 py-1">
                        {signupEmail}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-left space-y-2">
                  <h4 className="font-medium text-gray-900">Étapes suivantes :</h4>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Vérifiez votre boîte de réception (et dossier spam)</li>
                    <li>Cliquez sur le lien de confirmation dans l'email</li>
                    <li>Vous pourrez ensuite vous connecter à votre compte</li>
                  </ol>
                </div>

                <div className="pt-4">
                  <Button onClick={() => {
                  setSignupSuccess(false);
                  setSignupEmail('');
                }} variant="outline" className="w-full">
                    Retour à la connexion
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Music className="h-12 w-12 text-lyrical-600" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">Espace Connexion</h1>
            <p className="text-muted-foreground">
              Connectez-vous ou créez votre compte
            </p>
          </div>

          {/* Sélecteur du mode d'authentification */}
          <div className="mb-8">
            <div className="grid w-full grid-cols-2 gap-4">
              <button
                onClick={() => setAuthMode('login')}
                className={cn(
                  "p-4 border-2 rounded-lg transition-all duration-200 text-left",
                  authMode === 'login'
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <LogIn className="h-5 w-5" />
                  <div>
                    <div className="font-medium">J'ai déjà un compte</div>
                    <div className="text-sm text-muted-foreground">Me connecter</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setAuthMode('signup')}
                className={cn(
                  "p-4 border-2 rounded-lg transition-all duration-200 text-left",
                  authMode === 'signup'
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Créer mon compte</div>
                    <div className="text-sm text-muted-foreground">Première inscription</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Contenu basé sur la sélection */}
          {authMode === 'login' && (
              <Card>
                <CardHeader>
                  <CardTitle>{showForgotPassword ? "Réinitialiser le mot de passe" : "Connexion"}</CardTitle>
                  <CardDescription>
                    {showForgotPassword 
                      ? "Saisissez votre email pour recevoir un lien de réinitialisation"
                      : "Connectez-vous à votre compte"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showForgotPassword ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          placeholder="votre@email.com" 
                          value={loginForm.email} 
                          onChange={e => setLoginForm({
                            ...loginForm,
                            email: e.target.value
                          })} 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <Input 
                          id="login-password" 
                          type="password" 
                          value={loginForm.password} 
                          onChange={e => setLoginForm({
                            ...loginForm,
                            password: e.target.value
                          })} 
                          required 
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(true);
                            setForgotPasswordEmail(loginForm.email);
                          }}
                          className="text-sm text-primary hover:text-primary/80 underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600" 
                        disabled={loading}
                      >
                        {loading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {!forgotPasswordSent ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input 
                              id="forgot-email" 
                              type="email" 
                              placeholder="votre@email.com" 
                              value={forgotPasswordEmail} 
                              onChange={e => setForgotPasswordEmail(e.target.value)} 
                              required 
                            />
                          </div>
                          <Button 
                            type="button"
                            onClick={handleForgotPassword} 
                            className="w-full bg-gradient-to-r from-lyrical-600 to-gold-500 hover:from-lyrical-700 hover:to-gold-600" 
                            disabled={loading}
                          >
                            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                          </Button>
                        </>
                      ) : (
                        <div className="text-center space-y-4">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                          <div>
                            <h3 className="font-medium text-green-900 mb-1">Email envoyé</h3>
                            <p className="text-sm text-green-700">
                              Un lien de réinitialisation a été envoyé à <strong>{forgotPasswordEmail}</strong>
                            </p>
                          </div>
                        </div>
                      )}
                      <Button 
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotPasswordSent(false);
                          setForgotPasswordEmail('');
                        }}
                        variant="outline" 
                        className="w-full"
                      >
                        Retour à la connexion
                      </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
          )}

          {authMode === 'signup' && (
               <Card>
                 <CardHeader>
                   <div className="flex items-center justify-between mb-4">
                     <div>
                       <CardTitle className="text-xl font-semibold">Créer mon compte</CardTitle>
                       <CardDescription className="text-base mt-1">
                         Étape 1/4 : Choisissez votre profil
                       </CardDescription>
                     </div>
                     <div className="text-right">
                       <Progress value={25} className="w-16 h-2" />
                       <span className="text-xs text-muted-foreground mt-1 block">25%</span>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent>
                   {/* Sélecteur du type d'utilisateur */}
                   <div className="grid w-full grid-cols-2 gap-4 mb-6">
                     <button
                       onClick={() => setUserType('artist')}
                       className={cn(
                         "p-4 border-2 rounded-lg transition-all duration-200 text-left",
                         userType === 'artist'
                           ? "border-primary bg-primary/5 text-primary"
                           : "border-border hover:border-primary/50 hover:bg-muted/50"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <User className="h-5 w-5" />
                         <div>
                           <div className="font-medium">Artiste</div>
                           <div className="text-sm text-muted-foreground">Chanteur lyrique</div>
                         </div>
                       </div>
                     </button>
                     
                     <button
                       onClick={() => setUserType('professional')}
                       className={cn(
                         "p-4 border-2 rounded-lg transition-all duration-200 text-left",
                         userType === 'professional'
                           ? "border-primary bg-primary/5 text-primary"
                           : "border-border hover:border-primary/50 hover:bg-muted/50"
                       )}
                     >
                       <div className="flex items-center gap-3">
                         <Briefcase className="h-5 w-5" />
                         <div>
                           <div className="font-medium">Professionnel</div>
                           <div className="text-sm text-muted-foreground">Recruteur, agent</div>
                         </div>
                       </div>
                     </button>
                   </div>

                   {/* Contenu basé sur le type sélectionné */}
                   {userType === 'artist' && (
                     <div>
                       {/* Description du profil Artiste */}
                       <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-4 mb-6">
                         <div className="flex items-start gap-3">
                           <div className="bg-primary/10 rounded-full p-2">
                             <Star className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                             <h3 className="font-semibold text-base mb-2">Profil Artiste</h3>
                             <p className="text-sm text-muted-foreground mb-3">
                               Chanteurs : créez votre profil artistique, partagez votre répertoire et postulez aux auditions.
                             </p>
                           </div>
                         </div>
                       </div>

                      <form onSubmit={handleArtistSignup} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="artist-stage-name" className="text-sm font-medium">
                            Nom de scène ou nom professionnel
                          </Label>
                          <Input id="artist-stage-name" type="text" placeholder="ex: Maria Soprano, Jean Ténor..." value={artistSignupForm.stageName} onChange={e => setArtistSignupForm({
                          ...artistSignupForm,
                          stageName: e.target.value
                        })} required className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist-email" className="text-sm font-medium">Email professionnel</Label>
                          <Input id="artist-email" type="email" placeholder="votre@email.com" value={artistSignupForm.email} onChange={e => setArtistSignupForm({
                          ...artistSignupForm,
                          email: e.target.value
                        })} required className="h-11" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="artist-password" className="text-sm font-medium">Mot de passe</Label>
                            <Input id="artist-password" type="password" placeholder="Min. 8 caractères" value={artistSignupForm.password} onChange={e => setArtistSignupForm({
                            ...artistSignupForm,
                            password: e.target.value
                          })} required className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="artist-confirm-password" className="text-sm font-medium">Confirmer</Label>
                            <Input id="artist-confirm-password" type="password" placeholder="Répétez le mot de passe" value={artistSignupForm.confirmPassword} onChange={e => setArtistSignupForm({
                            ...artistSignupForm,
                            confirmPassword: e.target.value
                          })} required className="h-11" />
                          </div>
                        </div>

                        {/* Informations sur les coûts */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-amber-900 mb-1">
                                Abonnement requis
                              </p>
                              <p className="text-xs text-amber-700 mb-2">
                                À partir de 9€/mois pour accéder aux opportunités
                              </p>
                              <button type="button" className="text-xs text-amber-700 hover:text-amber-800 underline flex items-center gap-1" onClick={() => window.open('/pricing', '_blank')}>
                                Voir les tarifs <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base font-medium" disabled={loading}>
                          {loading ? <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Création en cours...
                            </span> : <span className="flex items-center gap-2">
                              Créer mon compte et choisir mon abonnement
                              <ArrowRight className="h-4 w-4" />
                            </span>}
                        </Button>

                        {/* Éléments de réassurance */}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Données sécurisées</span>
                          </div>
                          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Résiliation simple</span>
                          </div>
                         </div>
                       </form>
                     </div>
                   )}

                   {userType === 'professional' && (
                     <div>
                      {/* Description du profil Professionnel */}
                      <div className="bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/20 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                          <div className="bg-accent/10 rounded-full p-2">
                            <Building className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-base mb-2">Profil Professionnel</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              Recruteurs, agents, directeurs : trouvez et contactez les talents pour vos projets.
                            </p>
                            <div className="text-xs text-muted-foreground space-y-1">
                              
                            </div>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={handleProfessionalSignup} className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="pro-company-name" className="text-sm font-medium">
                            Nom de société / organisation
                          </Label>
                          <Input id="pro-company-name" type="text" placeholder="ex: Opéra National, Festival International..." value={professionalSignupForm.companyName} onChange={e => setProfessionalSignupForm({
                          ...professionalSignupForm,
                          companyName: e.target.value
                        })} required className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-role" className="text-sm font-medium">Votre métier</Label>
                          <Select value={professionalSignupForm.professionalRole} onValueChange={value => setProfessionalSignupForm({
                          ...professionalSignupForm,
                          professionalRole: value
                        })}>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Sélectionnez votre domaine d'activité" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="p-2">
                                <div className="text-xs font-medium text-muted-foreground mb-2 px-2">DIRECTION ARTISTIQUE</div>
                                <SelectItem value="casting_director">Directeur de casting / Directeur artistique</SelectItem>
                                <SelectItem value="opera_house_manager">Responsable de maison d&apos;opéra</SelectItem>
                                <SelectItem value="producer">Producteur de spectacle / festival</SelectItem>
                                
                                <div className="text-xs font-medium text-muted-foreground mb-2 mt-4 px-2">FORMATION & COACHING</div>
                                <SelectItem value="vocal_coach">Chef de chant / Coach vocal</SelectItem>
                                <SelectItem value="voice_teacher">Professeur de chant / Pédagogue</SelectItem>
                                
                                <div className="text-xs font-medium text-muted-foreground mb-2 mt-4 px-2">ACCOMPAGNEMENT</div>
                                <SelectItem value="conductor">Chef d&apos;orchestre</SelectItem>
                                <SelectItem value="artistic_agent">Agent artistique / Manager</SelectItem>
                                <SelectItem value="competition_director">Directeur de concours / jury</SelectItem>
                              </div>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-email" className="text-sm font-medium">Email professionnel</Label>
                          <Input id="pro-email" type="email" placeholder="votre@email.com" value={professionalSignupForm.email} onChange={e => setProfessionalSignupForm({
                          ...professionalSignupForm,
                          email: e.target.value
                        })} required className="h-11" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="pro-password" className="text-sm font-medium">Mot de passe</Label>
                            <Input id="pro-password" type="password" placeholder="Min. 8 caractères" value={professionalSignupForm.password} onChange={e => setProfessionalSignupForm({
                            ...professionalSignupForm,
                            password: e.target.value
                          })} required className="h-11" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pro-confirm-password" className="text-sm font-medium">Confirmer</Label>
                            <Input id="pro-confirm-password" type="password" placeholder="Répétez le mot de passe" value={professionalSignupForm.confirmPassword} onChange={e => setProfessionalSignupForm({
                            ...professionalSignupForm,
                            confirmPassword: e.target.value
                          })} required className="h-11" />
                          </div>
                        </div>

                        {/* Informations sur les coûts */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Accès professionnel
                              </p>
                              <p className="text-xs text-blue-700 mb-2">
                                À partir de 29€/mois pour recruter et contacter les artistes
                              </p>
                              <button type="button" className="text-xs text-blue-700 hover:text-blue-800 underline flex items-center gap-1" onClick={() => window.open('/pricing', '_blank')}>
                                Voir les tarifs <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-base font-medium" disabled={loading}>
                          {loading ? <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Création en cours...
                            </span> : <span className="flex items-center gap-2">
                              Créer mon compte et choisir mon abonnement
                              <ArrowRight className="h-4 w-4" />
                            </span>}
                        </Button>

                        {/* Éléments de réassurance */}
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>Données sécurisées</span>
                          </div>
                          <div className="w-1 h-1 bg-muted-foreground/40 rounded-full"></div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Aucun engagement</span>
                          </div>
                         </div>
                       </form>
                     </div>
                   )}
                 </CardContent>
               </Card>
          )}
        </div>
      </div>
    </Layout>;
};
export default Auth;