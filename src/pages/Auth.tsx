import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/layout/Layout';
import { Music, LogIn, UserPlus, User, Briefcase, Mail, CheckCircle, Shield, Clock, ArrowRight, Mic, Users, Award } from 'lucide-react';

const professionalRoleCategories = {
  direction: {
    label: "Direction artistique",
    roles: [
      { value: 'casting_director', label: 'Directeur de casting / Directeur artistique' },
      { value: 'conductor', label: 'Chef d\'orchestre' },
      { value: 'opera_house_manager', label: 'Responsable de maison d\'opéra' },
      { value: 'competition_director', label: 'Directeur de concours / jury' }
    ]
  },
  formation: {
    label: "Formation & coaching", 
    roles: [
      { value: 'vocal_coach', label: 'Chef de chant / Coach vocal' },
      { value: 'voice_teacher', label: 'Professeur de chant / Pédagogue' }
    ]
  },
  production: {
    label: "Production & representation",
    roles: [
      { value: 'artistic_agent', label: 'Agent artistique / Manager' },
      { value: 'producer', label: 'Producteur de spectacle / festival' }
    ]
  }
};

const allProfessionalRoles = Object.values(professionalRoleCategories).flatMap(category => category.roles);

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  
  const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  // Redirection si déjà authentifié
  useEffect(() => {
    if (user) {
      console.log('Utilisateur déjà connecté, redirection vers /pricing pour vérification abonnement');
      navigate('/pricing?source=login');
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
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        console.error('Erreur de connexion:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Connexion réussie');
        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Inscription artiste pour:', artistSignupForm.email);
      const { error } = await supabase.auth.signUp({
        email: artistSignupForm.email,
        password: artistSignupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: 'artist',
            stage_name: artistSignupForm.stageName,
          }
        }
      });

      if (error) {
        console.error('Erreur inscription artiste:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
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
        variant: "destructive",
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
        variant: "destructive",
      });
      return;
    }

    if (!professionalSignupForm.professionalRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner votre métier",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Inscription professionnel pour:', professionalSignupForm.email);
      const { error } = await supabase.auth.signUp({
        email: professionalSignupForm.email,
        password: professionalSignupForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            user_type: 'professional',
            company_name: professionalSignupForm.companyName,
            professional_role: professionalSignupForm.professionalRole,
          }
        }
      });

      if (error) {
        console.error('Erreur inscription professionnel:', error);
        toast({
          title: "Erreur d'inscription",
          description: error.message,
          variant: "destructive",
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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <Card className="text-center">
              <CardHeader>
                 <div className="flex items-center justify-center mb-4">
                   <div className="relative">
                     <CheckCircle className="h-16 w-16 text-green-500" />
                     <Mail className="h-8 w-8 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
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
                    <li>Connectez-vous et choisissez votre plan d'abonnement</li>
                    <li>Vous pourrez ensuite accéder à la plateforme</li>
                  </ol>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      setSignupSuccess(false);
                      setSignupEmail('');
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Retour à la connexion
                  </Button>
                </div>
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
               <Music className="h-12 w-12 text-primary" />
             </div>
            <h1 className="text-3xl font-serif font-bold mb-2">Espace Connexion</h1>
            <p className="text-muted-foreground">
              Connectez-vous ou créez votre compte
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                J'ai déjà un compte
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Créer mon compte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Mot de passe</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                     <Button 
                       type="submit" 
                       className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                       disabled={loading}
                     >
                       {loading ? 'Connexion...' : 'Se connecter'}
                     </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Étape 1/4 : Création du compte
                    </div>
                  </div>
                  <Progress value={25} className="mb-4" />
                  <CardTitle>Créer mon compte</CardTitle>
                  <CardDescription>
                    Rejoignez la communauté lyrique et accédez aux meilleures opportunités artistiques
                  </CardDescription>
                  
                  {/* Pricing transparency */}
                  <div className="bg-accent/20 border border-accent/30 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-accent-foreground" />
                      <span className="font-medium">Après inscription :</span>
                      <span>Choisissez votre plan (à partir de 9€/mois)</span>
                      <Button
                        variant="link" 
                        size="sm"
                        className="h-auto p-0 text-accent-foreground"
                        onClick={() => navigate('/pricing')}
                      >
                        Voir les tarifs
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="artist" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="artist" className="flex flex-col items-center gap-1 h-auto py-3">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span>Artiste</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-center">
                          Chanteurs, instrumentistes cherchant des opportunités
                        </span>
                      </TabsTrigger>
                      <TabsTrigger value="professional" className="flex flex-col items-center gap-1 h-auto py-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Professionnel</span>
                        </div>
                        <span className="text-xs text-muted-foreground text-center">
                          Directeurs artistiques, coachs, producteurs recrutant
                        </span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="artist" className="mt-6">
                      <div className="mb-4 p-3 bg-primary/5 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <Mic className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <h4 className="font-medium text-primary">Compte Artiste</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Créez votre profil, partagez votre répertoire et postulez aux auditions. 
                              Exemples : soprano lyrique, pianiste concertiste, chef de chœur.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleArtistSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="artist-stage-name">
                            Nom de scène ou nom professionnel
                          </Label>
                          <Input
                            id="artist-stage-name"
                            type="text"
                            placeholder="ex: Maria Soprano, Jean Pianiste"
                            value={artistSignupForm.stageName}
                            onChange={(e) => setArtistSignupForm({ ...artistSignupForm, stageName: e.target.value })}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Le nom sous lequel vous serez visible publiquement
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist-email">Email</Label>
                          <Input
                            id="artist-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={artistSignupForm.email}
                            onChange={(e) => setArtistSignupForm({ ...artistSignupForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist-password">Mot de passe</Label>
                          <Input
                            id="artist-password"
                            type="password"
                            value={artistSignupForm.password}
                            onChange={(e) => setArtistSignupForm({ ...artistSignupForm, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="artist-confirm-password">Confirmer le mot de passe</Label>
                          <Input
                            id="artist-confirm-password"
                            type="password"
                            value={artistSignupForm.confirmPassword}
                            onChange={(e) => setArtistSignupForm({ ...artistSignupForm, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                        
                        {/* Reassurance elements */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Shield className="h-4 w-4" />
                          <span>Vos données sont sécurisées • Aucun engagement</span>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          disabled={loading}
                        >
                          <div className="flex items-center gap-2">
                            {loading ? 'Inscription...' : "Créer mon compte artiste"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                          </div>
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="professional" className="mt-6">
                      <div className="mb-4 p-3 bg-secondary/10 rounded-lg border">
                        <div className="flex items-start gap-2">
                          <Users className="h-5 w-5 text-secondary mt-0.5" />
                          <div>
                            <h4 className="font-medium text-secondary">Compte Professionnel</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              Recrutez des talents, gérez vos auditions et développez votre réseau. 
                              Exemples : directeur d'opéra, coach vocal, agent artistique.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <form onSubmit={handleProfessionalSignup} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="pro-company-name">Nom de société / organisation</Label>
                          <Input
                            id="pro-company-name"
                            type="text"
                            placeholder="ex: Opéra de Paris, Studio Vocal, etc."
                            value={professionalSignupForm.companyName}
                            onChange={(e) => setProfessionalSignupForm({ ...professionalSignupForm, companyName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-role">Votre métier</Label>
                          <Select 
                            value={professionalSignupForm.professionalRole} 
                            onValueChange={(value) => setProfessionalSignupForm({ ...professionalSignupForm, professionalRole: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez votre domaine d'activité" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(professionalRoleCategories).map(([categoryKey, category]) => (
                                <div key={categoryKey}>
                                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                                    {category.label}
                                  </div>
                                  {category.roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-email">Email</Label>
                          <Input
                            id="pro-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={professionalSignupForm.email}
                            onChange={(e) => setProfessionalSignupForm({ ...professionalSignupForm, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-password">Mot de passe</Label>
                          <Input
                            id="pro-password"
                            type="password"
                            value={professionalSignupForm.password}
                            onChange={(e) => setProfessionalSignupForm({ ...professionalSignupForm, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pro-confirm-password">Confirmer le mot de passe</Label>
                          <Input
                            id="pro-confirm-password"
                            type="password"
                            value={professionalSignupForm.confirmPassword}
                            onChange={(e) => setProfessionalSignupForm({ ...professionalSignupForm, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                        
                        {/* Reassurance elements */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                          <Shield className="h-4 w-4" />
                          <span>Vos données sont sécurisées • Résiliation simple</span>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                          disabled={loading}
                        >
                          <div className="flex items-center gap-2">
                            {loading ? 'Inscription...' : "Créer mon compte professionnel"}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                          </div>
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
