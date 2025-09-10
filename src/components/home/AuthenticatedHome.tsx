import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users, TrendingUp, Plus, Bell } from 'lucide-react';
import SubscriptionDebug from '@/components/debug/SubscriptionDebug';
import operaDashboardHero from '@/assets/opera-dashboard-hero.jpg';

const AuthenticatedHome = () => {
  const { user } = useAuth();
  const { userType, isProfessional, isArtist, artistProfile, professionalProfile } = useUserType();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const getDisplayName = () => {
    if (isArtist && artistProfile) {
      return artistProfile.stage_name || 'Artiste';
    }
    if (isProfessional && professionalProfile) {
      return professionalProfile.company_name || 'Professionnel';
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserTypeLabel = () => {
    if (isArtist) return 'Artiste';
    if (isProfessional) return 'Professionnel';
    return 'Utilisateur';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner avec image d'opéra */}
        <div 
          className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-lyrical-900 to-gold-900 mb-8"
          style={{
            backgroundImage: `url(${operaDashboardHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
          <div className="relative h-full flex items-center justify-center px-8">
            <div className="text-white text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold mb-2">
                {getGreeting()}, {getDisplayName()} !
              </h1>
              <p className="text-white/90 text-lg">
                Voici un aperçu de votre activité récente sur Lyrisphere
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {isProfessional && (
            <>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel événement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/evenements/nouveau">
                    <Button size="sm" className="w-full">Créer</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card className="hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau casting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link to="/castings/nouveau">
                    <Button size="sm" className="w-full">Créer</Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}

          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/messages">
                <Button variant="outline" size="sm" className="w-full">Voir</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/notifications">
                <Button variant="outline" size="sm" className="w-full">Voir</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Mon profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Type de compte</p>
                <p className="font-medium">{getUserTypeLabel()}</p>
              </div>
              {isArtist && artistProfile && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Nom de scène</p>
                    <p className="font-medium">{artistProfile.stage_name}</p>
                  </div>
                  {artistProfile.voice_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tessiture</p>
                      <p className="font-medium">{artistProfile.voice_type}</p>
                    </div>
                  )}
                </>
              )}
              {isProfessional && professionalProfile && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">Entreprise</p>
                    <p className="font-medium">{professionalProfile.company_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rôle</p>
                    <p className="font-medium">{professionalProfile.professional_role}</p>
                  </div>
                </>
              )}
              <Link to="/profil">
                <Button variant="outline" size="sm" className="w-full">
                  Modifier le profil
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Vos données d'activité apparaîtront ici une fois que vous commencerez à utiliser la plateforme.
                </p>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="w-full">
                    Voir le tableau de bord complet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Accès rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isProfessional ? (
                <>
                  <Link to="/mes-evenements" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Mes événements
                    </Button>
                  </Link>
                  <Link to="/castings" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Mes castings
                    </Button>
                  </Link>
                  <Link to="/recherche-artistes" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Rechercher des artistes
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/castings" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Explorer les castings
                    </Button>
                  </Link>
                  <Link to="/evenements" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Explorer les événements
                    </Button>
                  </Link>
                  <Link to="/mes-candidatures" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Mes candidatures
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel pour les abonnements test */}
        <SubscriptionDebug />
      </div>
    </Layout>
  );
};

export default AuthenticatedHome;