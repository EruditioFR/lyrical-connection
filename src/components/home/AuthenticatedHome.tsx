import React from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useUserType } from '@/hooks/useUserType';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users, Plus, Bell, Mic, Briefcase, Search } from 'lucide-react';
import SubscriptionDebug from '@/components/debug/SubscriptionDebug';
import operaDashboardHero from '@/assets/opera-dashboard-hero.jpg';
import { useDashboardData } from '@/hooks/useDashboardData';
import RecentMessages from '@/components/home/RecentMessages';
import RecentNotifications from '@/components/home/RecentNotifications';
import ArtistsPreview from '@/components/home/ArtistsPreview';
import ProfessionalsPreview from '@/components/home/ProfessionalsPreview';

const AuthenticatedHome = () => {
  const { user } = useAuth();
  const { userType, isProfessional, isArtist, artistProfile, professionalProfile } = useUserType();
  const { 
    recentMessages, 
    recentNotifications, 
    artistsPreview, 
    professionalsPreview, 
    isLoading 
  } = useDashboardData();

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


        {/* Main Dashboard Grid - New Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Recent Messages */}
            <RecentMessages 
              messages={recentMessages} 
              isLoading={isLoading} 
            />

            {/* Recent Notifications */}
            <RecentNotifications 
              notifications={recentNotifications} 
              isLoading={isLoading} 
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Links - Enhanced */}
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
                        <Search className="h-4 w-4 mr-2" />
                        Rechercher des artistes
                      </Button>
                    </Link>
                    <Link to="/professionnels" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Explorer les professionnels
                      </Button>
                    </Link>
                    <Link to="/artistes" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Mic className="h-4 w-4 mr-2" />
                        Explorer les artistes
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
                    <Link to="/professionnels" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Explorer les professionnels
                      </Button>
                    </Link>
                    <Link to="/artistes" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <Mic className="h-4 w-4 mr-2" />
                        Explorer les artistes
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Artists Preview */}
            <ArtistsPreview 
              artists={artistsPreview} 
              isLoading={isLoading} 
            />

            {/* Professionals Preview */}
            <ProfessionalsPreview 
              professionals={professionalsPreview} 
              isLoading={isLoading} 
            />
          </div>
        </div>

        {/* Debug Panel pour les abonnements test */}
        <SubscriptionDebug />
      </div>
    </Layout>
  );
};

export default AuthenticatedHome;