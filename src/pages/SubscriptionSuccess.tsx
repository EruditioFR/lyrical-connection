import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Users, Calendar, Mail, Star, User, Eye, MessageCircle, BarChart3, FileCheck, Database, Search } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useUserType } from "@/hooks/useUserType";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const { checkSubscriptionStatus, subscription } = useSubscription();
  const { userType, isLoading: userTypeLoading } = useUserType();

  useEffect(() => {
    // Check subscription status when arriving on success page
    if (sessionId) {
      // Wait a bit for Stripe to process the webhook
      setTimeout(() => {
        checkSubscriptionStatus.mutate();
      }, 2000);
    }
  }, [sessionId]);

  const artistFeatures = [
    {
      icon: User,
      title: "Complétez votre profil artistique",
      description: "Ajoutez vos photos, vidéos, extraits audio et répertoire détaillé",
      path: "/profil"
    },
    {
      icon: Eye,
      title: "Maximisez votre visibilité",
      description: "Votre profil sera mis en avant dans les résultats de recherche",
      path: "/profil"
    },
    {
      icon: FileCheck,
      title: "Postulez aux auditions",
      description: "Recherchez et candidatez aux castings et événements",
      path: "/castings"
    },
    {
      icon: MessageCircle,
      title: "Échangez avec les professionnels",
      description: "Communiquez directement avec les directeurs artistiques",
      path: "/messages"
    },
    {
      icon: BarChart3,
      title: "Suivez vos statistiques",
      description: "Consultez les visites de votre profil et votre engagement",
      path: "/dashboard"
    }
  ];

  const professionalFeatures = [
    {
      icon: Database,
      title: "Recherche d'artistes avancée",
      description: "Accédez à notre base de données complète d'artistes lyriques",
      path: "/recherche-artistes"
    },
    {
      icon: Calendar,
      title: "Créer des événements",
      description: "Organisez vos auditions, concerts et représentations",
      path: "/evenements/nouveau"
    },
    {
      icon: Users,
      title: "Outils de casting",
      description: "Créez des appels à candidatures et gérez les réponses",
      path: "/castings/nouveau"
    },
    {
      icon: Mail,
      title: "Messagerie professionnelle",
      description: "Communiquez directement avec les artistes",
      path: "/messages"
    },
    {
      icon: BarChart3,
      title: "Tableau de bord professionnel",
      description: "Suivez vos statistiques et candidatures reçues",
      path: "/dashboard"
    }
  ];

  const features = userType === 'artist' ? artistFeatures : professionalFeatures;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Card */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-800">
                Félicitations ! Votre abonnement est activé
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {subscription?.plan?.name?.toLowerCase().includes('premium') ? (
                    <>
                      Votre <strong>abonnement Premium</strong> a été activé avec succès ! 
                      Vous avez maintenant accès à toutes les fonctionnalités avancées et à la visibilité maximale.
                    </>
                  ) : (
                    <>
                      Votre <strong>abonnement Classique</strong> a été activé avec succès ! 
                      Vous avez maintenant accès aux fonctionnalités essentielles de la plateforme.
                    </>
                  )}
                </AlertDescription>
              </Alert>
              
              <p className="text-muted-foreground">
                Découvrez ci-dessous tout ce que vous pouvez faire avec votre nouvelle souscription.
              </p>
            </CardContent>
          </Card>

          {/* Features Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center">
                🎯 Que pouvez-vous faire maintenant ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(feature.path)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Commencer l'exploration
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/subscription')}
              >
                Voir mon abonnement
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/profil')}
              >
                Compléter mon profil
              </Button>
            </div>
          </div>

          {/* Session Info */}
          {sessionId && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                ID de transaction : {sessionId}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}